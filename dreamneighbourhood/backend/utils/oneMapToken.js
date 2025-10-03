
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

export let token = null;
export let tokenExpiry = null;

const getOneMapToken = async () => {
  // Function to get a new token from OneMap API
  const url = "https://www.onemap.gov.sg//api/auth/post/getToken";

    // Prepare the data payload
    const data = JSON.stringify({
      email: process.env.ONEMAP_EMAIL,
      password: process.env.ONEMAP_EMAIL_PASSWORD
    });
    
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        token = response.access_token;
        tokenExpiry = response.expiry_timestamp;
        return response.json();  // Parse response as JSON
      })
      .then(data => {
        console.log(data);  // Log the response data to the console
      })
      .catch(error => {
        console.error('Error:', error);  // Log any errors
      });
    }

const isTokenValid = () => {
  // Check if the token is still valid (not expired)
  return token && tokenExpiry && (Date.now() < tokenExpiry);
}

export const fetchOneMapToken = async () => {
  // Fetch a new token if the current one is invalid or expired
  if (!isTokenValid()) {
    await getOneMapToken();
    console.log("New OneMap token fetched:", token);
    } else {
    console.log("Existing OneMap token is still valid.");
  }
    return token;
}

// Immediately fetch a token when the module is loaded
fetchOneMapToken();
