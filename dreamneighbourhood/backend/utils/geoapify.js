import axios from "axios";

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY;

/**
 * Maps frontend-friendly amenity keywords to Geoapify categories
 */
export const categoryMap = {
  "supermarket": "commercial.supermarket",
  "school": "education.school",
  "MRT Station": "public_transport.subway",
  "bus_station": "public_transport.bus",
  "hospital": "healthcare.hospital",
  "hawker": "commercial.food_and_drink",
  "sports": "sport",
};

/**
 * Fetches amenities around a property using Geoapify Places API
 * Returns array with lat, lng, and distance
 */
export const fetchAmenitiesAroundProperty = async (amenityType, lat, lng, radius = 2000) => {
  const category = categoryMap[amenityType];
  if (!category) return [];

  const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${lng},${lat},${radius}&bias=proximity:${lng},${lat}&limit=50&apiKey=${GEOAPIFY_API_KEY}`;

  try {
    const res = await axios.get(url);


    return res.data.features.map((f) => ({
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      distance: f.properties.distance, // distance from the point
      name: f.properties.name,
      address: f.properties.address_line1,
    }));
  } catch (err) {
    console.error(`Error fetching ${amenityType}:`, err.message);
    return [];
  }
};
