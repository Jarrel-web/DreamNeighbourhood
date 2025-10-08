import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

let token = null;
let tokenExpiry = null;

/**
 * Fetch a new OneMap token from the API
 */
const fetchNewToken = async () => {
  if (!process.env.ONEMAP_EMAIL || !process.env.ONEMAP_EMAIL_PASSWORD) {
    throw new Error("OneMap credentials missing in .env");
  }

  try {
    const res = await axios.post("https://www.onemap.gov.sg/api/auth/post/getToken", {
      email: process.env.ONEMAP_EMAIL,
      password: process.env.ONEMAP_EMAIL_PASSWORD,
    });

    const data = res.data;

    if (!data.access_token || !data.expiry_timestamp) {
      throw new Error("Invalid token response from OneMap");
    }

    token = data.access_token;
    tokenExpiry = data.expiry_timestamp; // Unix timestamp
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
export const getOneMapToken = async () => {
  const now = Math.floor(Date.now() / 1000);
  if (!token || !tokenExpiry || now >= tokenExpiry) {
    // Token expired or missing, fetch a new one
    return await fetchNewToken();
  }

  // Return cached token
  return token;
};




