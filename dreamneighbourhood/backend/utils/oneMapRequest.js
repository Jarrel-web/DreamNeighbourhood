import axios from "axios";
import { getOneMapToken } from "./oneMapToken.js";
export const makeOneMapRequest = async (endpoint, params) => {
  try {
    const token = await getOneMapToken();
    const apiUrl = `https://developers.onemap.sg/privateapi/convert/addrToCoord${endpoint}`; // Allows reuse for other API requests
    const response = await axios.get(apiUrl, {
      params,
      headers: { Authorization: `${token}` }, // Use the token for authentication
    });
    return response.data; // Return the API response data
  } catch (error) {
    console.error("Error making OneMap request:", error.message);
    throw new Error("Failed to fetch data from OneMap API");
  }
};