import express from "express";
import { rankPropertiesByAmenities } from "../controllers/searchController.js";

const router = express.Router();

router.post("/rank-properties", rankPropertiesByAmenities);

export default router;
