import { fetchOneMapToken } from "../utils/oneMapToken.js";

export const attachOneMapToken = async (req, res, next) => {
  try {
    const token = await fetchOneMapToken(); // Fetch the token using the utility function
    req.oneMapToken = token; // Attach the token to the request object
    next(); // Proceed next on the route handler
  } catch (error) {
    console.error("Error attaching OneMap token:", error.message);
    res.status(500).json({ message: "Failed to retrieve OneMap token", error: error.message });
  }
};