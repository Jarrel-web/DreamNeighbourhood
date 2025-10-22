import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export let token = null;
let tokenExpiry = null;

/**
 * Fetch a new OneMap token from the API
 */
const fetchNewToken = async () => {
  if (!process.env.ONEMAP_EMAIL || !process.env.ONEMAP_EMAIL_PASSWORD) {
    throw new Error("OneMap credentials missing in .env");
  }

  const requestData = {
    email: process.env.ONEMAP_EMAIL,
    password: process.env.ONEMAP_EMAIL_PASSWORD
  }

  try {
    const res = await axios.post("https://www.onemap.gov.sg/api/auth/post/getToken", 
      requestData,{
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const responseData = res.data;

    if (!responseData.access_token || !responseData.expiry_timestamp) {
      throw new Error("Invalid token response from OneMap");
    }

    token = responseData.access_token;
    tokenExpiry = responseData.expiry_timestamp; // Unix timestamp
    console.log("✅ OneMap token fetched");

    return token;
  } catch (err) {
    console.error("❌ Error fetching OneMap token:", err.message);
    throw err;
  }
};

/**
 * Returns a valid OneMap token (cached if not expired)
 */
export const fetchOneMapToken = async () => {
  const now = Math.floor(Date.now() / 1000);
  if (!token || !tokenExpiry || now >= tokenExpiry) {
    // Token expired or missing, fetch a new one
    return await fetchNewToken();
  }

  // Return cached token
  return token;
};

fetchOneMapToken(); // Initial fetch on startup to avoid delay on first request


