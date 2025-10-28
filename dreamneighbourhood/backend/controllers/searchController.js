import { pool } from "../config/db.js";
import { fetchAmenitiesAroundProperty } from "../utils/geoapify.js";
import { scoreProperty } from "../utils/scoringUtils.js";

export const rankPropertiesByAmenities = async (req, res) => {
  try {
    const { rankings } = req.body;
    const { town } = req.query;

    if (!town) 
      return res.status(400).json({ message: "town is required" });

    if (!rankings || !Array.isArray(rankings) || rankings.length === 0) {
      return res.status(400).json({ message: "rankings array is required in body" });
    }

    // Build query — only filter by town
    const { data: properties, error } = await pool
      .from("properties")
      .select("*")
      .eq("town", town.toUpperCase());

    if (error) throw error;

    if (!properties || properties.length === 0)
      return res.status(404).json({ message: "No properties found" });

    // Score properties based on amenities only
    const scoredProperties = await Promise.all(
      properties.map((p) => scoreProperty(p, rankings, fetchAmenitiesAroundProperty))
    );

    scoredProperties.sort((a, b) => b.totalScore - a.totalScore);

    res.status(200).json({ message: "Ranked properties", results: scoredProperties });
  } catch (err) {
    console.error("Error in rankPropertiesByAmenities:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
