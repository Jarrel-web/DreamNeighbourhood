import fetch from 'node-fetch';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

let token = null;
let tokenExpiry = null;

// Encryption key (use a secure key and store it in your .env file)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; 
const IV_LENGTH = 16; // Initialization vector length

// Function to encrypt data
const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex'); // Combine IV and encrypted data
};

// Function to decrypt data
const decrypt = (encryptedText) => {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedData = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

const getOneMapToken = async () => {
  // Function to get a new token from OneMap API
  const url = "https://www.onemap.gov.sg/api/auth/post/getToken";

  // Prepare the data payload
  const data = JSON.stringify({
    email: process.env.ONEMAP_EMAIL,
    password: process.env.ONEMAP_EMAIL_PASSWORD,
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();

    // Encrypt the token before storing it in memory
    token = encrypt(responseData.access_token);
    tokenExpiry = responseData.expiry_timestamp; // Store expiry timestamp as is (Unix format)

    console.log("New token fetched.");
  } catch (error) {
    console.error('Error fetching OneMap token:', error);
    throw error;
  }
};

const isTokenValid = () => {
  // Check if the token is still valid (not expired)
  return token && tokenExpiry && Math.floor(Date.now() / 1000) < tokenExpiry;
};

const fetchOneMapToken = async () => {
  // Fetch a new token if the current one is invalid or expired
  if (!isTokenValid()) {
    await getOneMapToken();
    console.log("New OneMap token fetched.");
  } else {
    console.log("Existing OneMap token is still valid.");
  }

  // Decrypt the token before returning it
  return decrypt(token);
};

// Immediately fetch a token when the module is loaded
fetchOneMapToken();

export default fetchOneMapToken;
