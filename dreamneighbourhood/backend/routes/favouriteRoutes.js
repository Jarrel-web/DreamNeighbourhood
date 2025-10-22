import express from "express";
import {
  viewFavoriteProperty,
  addFavoriteProperty,
  removeFavoriteProperty,
 
} from "../controllers/favouritesController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Protected routes
router.get("/", authenticateToken, viewFavoriteProperty);

router.post("/add", authenticateToken, addFavoriteProperty);
router.delete("/:property_id", authenticateToken, removeFavoriteProperty); 

export default router;