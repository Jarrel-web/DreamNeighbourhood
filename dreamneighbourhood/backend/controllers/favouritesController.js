import { pool } from "../config/db.js";

export const addFavoriteProperty = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID (to refer to the db)
    const { propertyId } = req.body; // Extract property ID (can use postal code or address returned from OneMap query)


    // Check if the property already exists in the user's favorites
    const existingFavorite = await pool.query(
      "SELECT * FROM user_favorites WHERE user_id = $1 AND property_id = $2",
      [userId, propertyId]
    );

    if (existingFavorite.rows.length > 0) {
      return res.status(400).json({ message: "Property is already in favorites" });
    }

    // Add the property to the user's favorites
    await pool.query(
      "INSERT INTO user_favorites (user_id, property_id) VALUES ($1, $2)",
      [userId, propertyId]
    );

    res.status(201).json({ message: "Property added to favorites" });
  } catch (error) {
    console.error("Error adding favorite property:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};