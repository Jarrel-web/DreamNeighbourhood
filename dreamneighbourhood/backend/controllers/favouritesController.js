import { pool } from "../config/db.js";

// GET if property is favourite
export const getFavouriteProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.propertyId;

    const { data, error } = await pool
      .from("user_favorites")
      .select("*")
      .eq("user_id", userId)
      .eq("property_id", propertyId);

    if (error) throw error;

    res.status(200).json({ isFavourite: data.length > 0 });
  } catch (error) {
    console.error("Error fetching favourite:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET all favourite properties
export const viewFavoriteProperty = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await pool
      .from("user_favorites")
      .select("*, properties(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (data.length === 0) {
      return res.status(200).json({
        favourites: [],
        message: "You have no favourite properties yet.",
      });
    }

    res.status(200).json({
      favourites: data.map(fav => fav.properties),
      message: "Favourites retrieved successfully.",
    });
  } catch (error) {
    console.error("Error fetching favourites:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST add favourite
export const addFavoriteProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.body;

    if (!propertyId)
      return res.status(400).json({ message: "Property ID is required" });

    // Check property exists
    const { data: propData, error: propError } = await pool
      .from("properties")
      .select("id")
      .eq("id", propertyId)
      .single();

    if (propError || !propData)
      return res.status(404).json({ message: "Property not found" });

    // Check existing favourite
    const { data: favData, error: favError } = await pool
      .from("user_favorites")
      .select("*")
      .eq("user_id", userId)
      .eq("property_id", propertyId);

    if (favError) throw favError;
    if (favData.length > 0)
      return res.status(400).json({ message: "Property already in favourites" });

    // Insert favourite
    const { error: insertError } = await pool
      .from("user_favorites")
      .insert([{ user_id: userId, property_id: propertyId }]);

    if (insertError) throw insertError;

    res.status(201).json({ message: "Property added to favourites" });
  } catch (error) {
    console.error("Error adding favourite:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE remove favourite
export const removeFavoriteProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.property_id;

    if (!propertyId)
      return res.status(400).json({ message: "Property ID is required" });

    // Check favourite exists
    const { data: favData, error: favError } = await pool
      .from("user_favorites")
      .select("*")
      .eq("user_id", userId)
      .eq("property_id", propertyId);

    if (favError) throw favError;
    if (favData.length === 0)
      return res.status(404).json({ message: "Favourite not found" });

    // Delete favourite
    const { error: delError } = await pool
      .from("user_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("property_id", propertyId);

    if (delError) throw delError;

    res.status(200).json({ message: "Removed from favourites successfully" });
  } catch (error) {
    console.error("Error removing favourite:", error);
    res.status(500).json({ message: "Server error" });
  }
};
