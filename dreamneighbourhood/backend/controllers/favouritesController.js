import { pool } from "../config/db.js";


export const viewFavoriteProperty = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT * FROM favourites WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        favourites: [],
        message: "You have no favourite properties yet.",
      });
    }

    res.status(200).json({
      favourites: result.rows,
      message: "Favourites retrieved successfully.",
    });
  } catch (error) {
    console.error("Error fetching favourites:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const addFavoriteProperty = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID (to refer to the db)
    const { propertyId: propertyAddr } = req.body; // Extract property address 

    if (!propertyAddr) {
      return res.status(400).json({ message: "Property address is required." });
    }

    // Check if property exists
    const propertyExists = await pool.query(
      "SELECT id FROM properties WHERE id = $1",
      [propertyAddr]
    );
    if (propertyExists.rowCount === 0) {
      return res.status(404).json({ message: "Property not found." });
    }


    // Check if the property already exists by matching user and address.
    const existingFavorite = await pool.query(
      "SELECT * FROM user_favorites WHERE user_id = $1 AND property_addr = $2",
      [userId, propertyAddr]
    );

    if (existingFavorite.rows.length > 0) {
      return res.status(400).json({ message: "Property is already in favorites" });
    }

    // Add the property to the user's favorites
    await pool.query(
      "INSERT INTO user_favorites (user_id, property_addr) VALUES ($1, $2)",
      [userId, propertyAddr]
    );

    res.status(201).json({ message: "Property added to favorites" });
  } catch (error) {
    console.error("Error adding favorite property:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeFavoriteProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { property_id: property_addr } = req.params;

     if (!property_addr) {
      return res.status(400).json({ message: "Property Address is required." });
    }

    // Check if favourite exists in database
    const favCheck = await pool.query(
      "SELECT * FROM favourites WHERE user_id = $1 AND property_addr = $2",
      [userId, property_addr]
    );
    if (favCheck.rowCount === 0) {
      return res.status(404).json({ message: "Favourite not found." });
    }

    // Remove favourite
    await pool.query(
      "DELETE FROM favourites WHERE user_id = $1 AND property_addr = $2",
      [userId, property_addr]
    );

    res.status(200).json({ message: "Removed from favourites successfully." });
  } catch (error) {
    console.error("Error removing favourite:", error);
    res.status(500).json({ message: "Server error" });
  }
};