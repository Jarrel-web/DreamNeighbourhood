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