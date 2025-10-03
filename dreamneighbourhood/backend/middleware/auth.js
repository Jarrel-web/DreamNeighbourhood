import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  // Get token from headers (Authorization: Bearer <token>)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request
    next(); // proceed to route handler
  } catch (error) {
    res.status(403).json({ message: "Invalid token", error: error.message });
  }
};
