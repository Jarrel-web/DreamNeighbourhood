import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes.js";
import favouriteRoutes from "./routes/favouriteRoutes.js";
import openMapRoutes from "./routes/openMapRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());


app.use(cors({
  origin: "http://localhost:5173", // your Vite frontend URL
  credentials: true, // if you plan to send cookies or auth headers
}));

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
