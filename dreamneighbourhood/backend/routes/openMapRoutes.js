import express from "express";
import { searchHandler } from "../controllers/searchController.js";
import { attachOneMapToken } from "../middleware/oneMapAuth.js";

const router = express.Router();

// Route for search requests
router.get("/search", attachOneMapToken, searchHandler);

export default router;