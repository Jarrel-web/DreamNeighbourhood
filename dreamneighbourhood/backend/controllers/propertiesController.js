// controllers/propertyController.js
import { PropertyService } from "../services/propertyService.js";

// Singleton instance
let propertyServiceInstance = null;

function getPropertyService() {
  if (!propertyServiceInstance) {
    propertyServiceInstance = new PropertyService();
  }
  return propertyServiceInstance;
}

// GET default properties (NO PAGINATION - return all) - EXACT SAME
export const getDefaultProperties = async (req, res) => {
  try {
    const propertyService = getPropertyService();
    const result = await propertyService.getDefaultProperties();

    // EXACT same response as original
    res.json({
      results: result.results || [],
      total: result.total || 0
    });
  } catch (err) {
    console.error(err);
    // EXACT same error handling
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET property by ID - EXACT SAME
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    const propertyService = getPropertyService();
    const property = await propertyService.getPropertyById(id);

    // EXACT same response as original
    res.json(property);
  } catch (err) {
    console.error("Error fetching property details:", err);
    
    // EXACT same error handling
    if (err.message === "Property not found") {
      return res.status(404).json({ message: err.message });
    }
    if (err.message === "Property ID is required") {
      return res.status(400).json({ message: err.message });
    }
    
    res.status(500).json({ message: "Server error", error: err.message });
  }
};