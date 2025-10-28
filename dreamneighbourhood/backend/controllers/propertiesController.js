import { pool } from "../config/db.js";

// GET default properties (NO PAGINATION - return all)
export const getDefaultProperties = async (req, res) => {
  try {
    // IGNORE pagination parameters - return all results
    const { data, error } = await pool
      .from("properties")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    res.json({
      results: data || [],
      total: data?.length || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET property by ID
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ message: "Property ID is required" });

    const { data, error } = await pool
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data)
      return res.status(404).json({ message: "Property not found" });

    res.json(data);
  } catch (err) {
    console.error("Error fetching property details:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};