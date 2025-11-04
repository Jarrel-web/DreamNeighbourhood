// services/FavouriteService.js
import { FavouriteRepository } from "../repositories/favouriteRepository.js";
import { PropertyRepository } from "../repositories/propertyRepository.js";

export class FavouriteService {
  constructor() {
    this.favouriteRepository = new FavouriteRepository();
    this.propertyRepository = new PropertyRepository();
  }

  
  async isPropertyFavourite(userId, propertyId) {
    const data = await this.favouriteRepository.findByUserAndProperty(userId, propertyId);
    return { isFavourite: data.length > 0 };
  }

  
  async getUserFavourites(userId) {
    const data = await this.favouriteRepository.findAllByUser(userId);

    if (data.length === 0) {
      return {
        favourites: [],
        message: "You have no favourite properties yet."
      };
    }

    return {
      favourites: data.map(fav => fav.properties),
      message: "Favourites retrieved successfully."
    };
  }


  async addFavourite(userId, propertyId) {
    if (!propertyId) {
      throw new Error("Property ID is required");
    }

   
    const propertyExists = await this.propertyRepository.exists(propertyId);
    if (!propertyExists) {
      throw new Error("Property not found");
    }

    
    const existingFav = await this.favouriteRepository.findByUserAndProperty(userId, propertyId);
    if (existingFav.length > 0) {
      throw new Error("Property already in favourites");
    }

    await this.favouriteRepository.create(userId, propertyId);

    return { message: "Property added to favourites" };
  }

  // DELETE remove favourite - EXACT SAME BEHAVIOR
  async removeFavourite(userId, propertyId) {
    if (!propertyId) {
      throw new Error("Property ID is required");
    }

    // Check favourite exists - EXACT SAME
    const existingFav = await this.favouriteRepository.findByUserAndProperty(userId, propertyId);
    if (existingFav.length === 0) {
      throw new Error("Favourite not found");
    }

    // Delete favourite - EXACT SAME
    await this.favouriteRepository.delete(userId, propertyId);

    return { message: "Removed from favourites successfully" };
  }
}