import axios from "axios";
import { token } from "../utils/oneMapToken";

export const searchHandler = async (req, res) => {
  try {
    const { query } = req.query; // Extract the search query from query parameters

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Define the API endpoint and authentication details
    const apiUrl = "https://www.onemap.gov.sg/api/common/elastic/search";
    const authToken = token; // Use the token from oneMapToken.js

    // Make the authenticated request to the external API
    const response = await axios.get(apiUrl, {
      params: { searchVal: query, returnGeom: "Y", getAddrDetails: "Y" },
      headers: { Authorization: `Bearer ${authToken}` }, // Include the API key in the Authorization header
    });

    // Return the API response to the client
    res.status(200).json({
      message: "Search results",
      results: response.data,
    });

    return response.json(); // Return response as JSON
  } catch (error) {
    console.error("Error handling search:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};