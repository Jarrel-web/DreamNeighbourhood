import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes.js";
import favouriteRoutes from "./routes/favouriteRoutes.js";
import openMapRoutes from "./routes/openMapRoutes.js";
import { pool } from "./config/db.js";
dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api/v1/users", userRoutes);
app.get("/api/v1/favourites/view", favouriteRoutes);
app.post("/api/v1/favourites/add", favouriteRoutes);
app.delete("/api/v1/favourites/delete", favouriteRoutes);
app.use("/api/v1/search", openMapRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


export default app;
