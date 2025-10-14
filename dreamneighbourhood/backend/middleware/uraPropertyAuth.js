import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

const url = "https://eservice.ura.gov.sg/uraDataService/insertNewToken/v1";
const access_key = process.env.URA_ACCESS_KEY;
let token = null;

export const getUraToken = async () => {
  try {
    if (token) {
      console.log("Returning cached URA token");
      return token;
    }

    const response = await axios.get(url, {
      headers: { AccessKey: access_key },
    });

    token = response.data.Result;
    console.log("New URA token retrieved");
    return token;
  } catch (err) {
    console.error("Failed to get URA token:", err.message);
    throw err;
  }
};