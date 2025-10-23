import { pool } from "../config/db.js";

const DEFAULT_LIMIT = 50;

// Fetch default first 50 properties with no filters
export const getDefaultProperties = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM properties ORDER BY id ASC LIMIT $1",
      [DEFAULT_LIMIT]
    );
    res.json({ results: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Fetch details of a single property by ID
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Property ID is required" });

    const query = "SELECT * FROM properties WHERE id = $1";
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json(rows[0]); // ✅ Send a single property as JSON
  } catch (err) {
    console.error("Error fetching property details:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
