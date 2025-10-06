import { makeOneMapRequest } from "../utils/oneMapRequest.js";

export const searchHandler = async (req, res) => {
  try {
    const { query } = req.query; // Extract the search query from query parameters

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Use the token attached by oneMapAuth
    const token = req.oneMapToken;

    // Define the parameters for the OneMap API request
    const params = { searchVal: query, returnGeom: "Y", getAddrDetails: "Y" };

    // Make the API request
    const data = await makeOneMapRequest("common/elastic/search", params, token);

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