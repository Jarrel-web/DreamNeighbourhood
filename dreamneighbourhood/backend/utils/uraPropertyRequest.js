import { getUraToken } from "../middleware/uraPropertyAuth.js";
import axios from 'axios';

const token = await getUraToken();
const access_key = process.env.URA_ACCESS_KEY;

export const uraPropertySearch = async (endpoint, params) => {
    try {
        const apiUrl = `https://www.ura.gov.sg/uraDataService/v1?${endpoint}`;
        const response = await axios.get(apiUrl, {
            params: {params},
            headers: {"AccessKey": access_key, "Token": token} 
        })
        return response.data; // Return the API response data

    } catch (error) {
        console.error("Error making URA Property request:", error.message);
        throw new Error("Failed to fetch data from URA Property API");
    }
}