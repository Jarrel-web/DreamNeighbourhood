import express from "express";
import {
  getDefaultProperties,
  getPropertyById,
  
} from "../controllers/propertiesController.js"; 

const router = express.Router();

router.get("/default", getDefaultProperties);

router.get("/:id", getPropertyById);

export default router;