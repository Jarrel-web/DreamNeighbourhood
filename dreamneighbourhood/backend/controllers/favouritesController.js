// controllers/favouriteController.js
import { FavouriteService } from "../services/favouriteService.js";

// Singleton instance
let favouriteServiceInstance = null;

function getFavouriteService() {
  if (!favouriteServiceInstance) {
    favouriteServiceInstance = new FavouriteService();
  }
  return favouriteServiceInstance;
}


export const getFavouriteProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.propertyId;

    const favouriteService = getFavouriteService();
    const result = await favouriteService.isPropertyFavourite(userId, propertyId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching favourite:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET all favourite properties - EXACT SAME
export const viewFavoriteProperty = async (req, res) => {
  try {
    const userId = req.user.id;

    const favouriteService = getFavouriteService();
    const result = await favouriteService.getUserFavourites(userId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching favourites:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const addFavoriteProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.body;

    const favouriteService = getFavouriteService();
    const result = await favouriteService.addFavourite(userId, propertyId);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding favourite:", error.message);
    
    
    if (error.message === "Property ID is required") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Property not found") {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === "Property already in favourites") {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const removeFavoriteProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const propertyId = req.params.property_id;

    const favouriteService = getFavouriteService();
    const result = await favouriteService.removeFavourite(userId, propertyId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error removing favourite:", error);
    
    // EXACT same error handling
    if (error.message === "Property ID is required") {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === "Favourite not found") {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: "Server error" });
  }
};