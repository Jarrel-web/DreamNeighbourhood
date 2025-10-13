import { oneMapSearch } from "../utils/oneMapRequest.js";
import { uraPropertySearch } from "../utils/uraPropertyRequest.js";

export const searchHandler = async (req, res) => {
  try {
    const { query, amenity} = req.query; // Extract the search query, include optional amenity parameter

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    
    const searchVal = amenity ? `${query} ${amenity}` : query; // Modify searchVal according to the presence of amenity filter.

    // Define the parameters for the OneMap API request
    const params = { searchVal, returnGeom: "Y", getAddrDetails: "Y" };

    // Make the API request
    const data = await oneMapSearch("common/elastic/search", params);

    console.log(data);

    // Return the API response
    res.status(200).json({
      message: "Search results",
      results: data.results,
    });
  } catch (error) {
    console.error("Error handling search:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const amenityDistanceFilter = async (req, res) => {
  try {
    // Initialise parameters for search, including default values if not provided
    const {amenityThemes, maxDistanceKm} = req.body;
    const {query} = req.query ? req.query : {query: ""};
    

  } catch (error) {
    console.error("Error handling amenity distance filter:", error.message);
    res.status(500).json({message: "Server error", error: error.message});
  }
}

