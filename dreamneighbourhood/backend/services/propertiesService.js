import { pool } from "../config/db.js";

export const fetchPropertiesInDistrict = async (district, filters = {}) => {
  const [[minLat, minLng], [maxLat, maxLng]] = await getDistrictBoundaries(district);

  let query = pool.from("properties")
    .select("*")
    .gte("latitude", minLat)
    .lte("latitude", maxLat)
    .gte("longitude", minLng)
    .lte("longitude", maxLng);

  if (filters.minPrice) query = query.gte("resale_price", parseFloat(filters.minPrice));
  if (filters.maxPrice) query = query.lte("resale_price", parseFloat(filters.maxPrice));
  if (filters.minArea) query = query.gte("floor_area", parseFloat(filters.minArea));
  if (filters.maxArea) query = query.lte("floor_area", parseFloat(filters.maxArea));

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Helper to get boundaries from map_boundaries table
import { getBoundaries } from "../scripts/drawMapBoundaries.js";
const getDistrictBoundaries = async (district) => {
  const boundariesData = await getBoundaries(district.toUpperCase());
  if (!boundariesData[district]) throw new Error("District boundaries not found");
  return boundariesData[district];
};
