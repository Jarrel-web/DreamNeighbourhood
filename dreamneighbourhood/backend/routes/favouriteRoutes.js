import express from "express";
import {
  viewFavoriteProperty,
  addFavoriteProperty,
  removeFavoriteProperty,
} from "../controllers/favouritesController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Protected routes
router.get("/view", authenticateToken, viewFavoriteProperty);
router.post("/add", authenticateToken, addFavoriteProperty);
router.delete("/delete", authenticateToken, removeFavoriteProperty); 

export default router;