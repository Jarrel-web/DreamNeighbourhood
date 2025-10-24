import express from "express";
import {
  getDefaultProperties,
  getPropertyById,
  searchProperties
} from "../controllers/propertiesController.js"; 

const router = express.Router();

router.get("/default", getDefaultProperties);
router.get("/search", searchProperties);
router.get("/:id", getPropertyById);

export default router;