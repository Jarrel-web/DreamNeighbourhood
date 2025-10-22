import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import userRoutes from "./routes/userRoutes.js";
import favouriteRoutes from "./routes/favouriteRoutes.js";
import propertiesRoutes from "./routes/propertiesRoutes.js";
//import openMapRoutes from "./routes/openMapRoutes.js";

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
app.use("/api/v1/favourites", favouriteRoutes);
//app.use("/api/v1/search", openMapRoutes);
app.use("/api/v1/properties", propertiesRoutes);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


export default app;
