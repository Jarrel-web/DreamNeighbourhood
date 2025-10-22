
import { fetchOneMapToken } from "./oneMapToken.js";

import axios from "axios";


export const oneMapSearch = async (endpoint, params='') => {
  try {
    const token = await fetchOneMapToken();
    const apiUrl = `https://www.onemap.gov.sg/api/${endpoint}`; // Allows reuse for other API requests
    const response = await axios.get(apiUrl, {
      params: params,
      headers: { 
        Authorization: `${token}`,
       'Content-Type': 'application/json'
      } 
    })
    return response.data; // Return the API response data
  } catch (error) {
    console.error("Error making OneMap request:", {
      endpoint,
      params,
      error: error.response?.data || error.message});
    throw new Error(`Failed to fetch data from OneMap API: ${error.message}`);
  }
};
