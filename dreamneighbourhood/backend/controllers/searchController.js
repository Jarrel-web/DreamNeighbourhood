// controllers/searchController.js
import { SearchService } from "../services/searchService.js";

// Singleton instance
let searchServiceInstance = null;

function getSearchService() {
  if (!searchServiceInstance) {
    searchServiceInstance = new SearchService();
  }
  return searchServiceInstance;
}

// Rank properties by amenities
export const rankPropertiesByAmenities = async (req, res) => {
  try {
    const { rankings } = req.body;
    const { town } = req.query;

    const searchService = getSearchService();
    const result = await searchService.rankPropertiesByAmenities(town, rankings);

    res.status(200).json(result);
  } catch (err) {
    console.error("Error in rankPropertiesByAmenities:", err.message);
    
    // EXACT same error handling
    if (err.message === "town is required") {
      return res.status(400).json({ message: err.message });
    }
    if (err.message === "rankings array is required in body") {
      return res.status(400).json({ message: err.message });
    }
    if (err.message === "No properties found") {
      return res.status(404).json({ message: err.message });
    }
    
    res.status(500).json({ message: "Server error", error: err.message });
  }
};