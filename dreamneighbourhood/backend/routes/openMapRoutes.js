import express from "express";
import { searchHandler } from "../controllers/searchController.js";

const router = express.Router();

// Handles search inquiries
router.get("https://www.onemap.gov.sg/api/common/elastic/search", searchHandler);

export default router;