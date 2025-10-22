import express from "express";
import { getDefaultProperties} from "../controllers/propertiesController.js";

const router = express.Router();


router.get("/default", getDefaultProperties);



export default router;