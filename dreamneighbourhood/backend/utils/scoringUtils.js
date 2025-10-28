export const scoreProperty = async (property, rankings, fetchAmenityFn) => {
  let totalScore = 0;
  let amenityScores = {};

  for (const { amenityTheme, rank, maxDistance } of rankings) {
    const weight = 1 / rank;

    const amenities = await fetchAmenityFn(amenityTheme, property.latitude, property.longitude, maxDistance);
    const minDist = amenities.length ? Math.min(...amenities.map(a => a.distance)) : Infinity;

    let score = 0;
    if (minDist <= maxDistance) score = (1 - minDist / maxDistance) * weight;

    amenityScores[amenityTheme] = { distance: minDist, score };
    totalScore += score;
  }

  return { ...property, totalScore, amenityScores };
};