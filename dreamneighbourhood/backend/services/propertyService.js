// services/PropertyService.js
import { PropertyRepository } from "../repositories/propertyRepository.js";

export class PropertyService {
  constructor() {
    this.propertyRepository = new PropertyRepository();
  }

  // GET default properties - EXACT SAME BEHAVIOR
  async getDefaultProperties() {
    const data = await this.propertyRepository.findAll();
    
    // Return EXACT same response structure
    return {
      results: data || [],
      total: data?.length || 0
    };
  }

  // GET property by ID - EXACT SAME BEHAVIOR
  async getPropertyById(id) {
    if (!id) {
      throw new Error("Property ID is required");
    }

    const data = await this.propertyRepository.findById(id);
    
    if (!data) {
      throw new Error("Property not found");
    }

    return data;
  }
}