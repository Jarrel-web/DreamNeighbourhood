
import { token } from "./oneMapToken.js";

const axios = require("axios");
export const oneMapSearch = async (endpoint, params) => {
  try {
    const apiUrl = `https://www.onemap.sg/api/${endpoint}`; // Allows reuse for other API requests
    const response = await axios.get(apiUrl, {
      params: {params},
      headers: { Authorization: `${token}` }, // Use the token for authentication
    }).then(res => res.json());
    return response.data; // Return the API response data
  } catch (error) {
    console.error("Error making OneMap request:", error.message);
    throw new Error("Failed to fetch data from OneMap API");
  }
};
