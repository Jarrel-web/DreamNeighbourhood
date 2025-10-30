export const scoreProperty = async (property, rankings, fetchAmenityFn) => {
  let totalScore = 0;
  const amenityScores = {};

  for (const { amenityTheme, rank, maxDistance } of rankings) {
    const weight = 1 / rank;

    const amenities = await fetchAmenityFn(
      amenityTheme,
      property.latitude,
      property.longitude,
      maxDistance
    );

    if (!amenities || amenities.length === 0) {
      amenityScores[amenityTheme] = { distance: null, score: 0, amenity: null };
      continue;
    }

    // Only keep the closest amenity
    const closest = amenities.reduce(
      (prev, curr) => (curr.distance < prev.distance ? curr : prev)
    );

    let score = 0;
    if (closest.distance <= maxDistance) {
      score = (1 - closest.distance / maxDistance) * weight;
    }

    amenityScores[amenityTheme] = {
      distance: closest.distance,
      score,
      amenity: {
        name: closest.name,
        type: amenityTheme,
        distance: closest.distance,
        lat: closest.lat,
        lon: closest.lng,
        formattedAddress: closest.address || null,
        website: closest.website || null,
        opening_hours: closest.opening_hours || null,
      },
    };

    totalScore += score;
  }

  return { ...property, totalScore, amenityScores };
};
