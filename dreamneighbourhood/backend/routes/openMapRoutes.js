import express from "express";
import { searchHandler } from "../controllers/searchController.js";
import { amenityDistanceFilter } from "../controllers/searchController.js";
import { attachOneMapToken } from "../middleware/oneMapAuth.js";
import { getCurrentSearchPage } from "../middleware/currentSearchPage.js";
import { cacheSearchPage } from "../middleware/currentSearchPage.js";

const router = express.Router();

// Route for search requests -> attach (middleware) -> controller -> middleware (optional)
router.get("/search", attachOneMapToken, searchHandler);
router.get("/amenity_sort", amenityDistanceFilter);

export default router;