import express from "express";
import { registerUser, verifyEmail, loginUser} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";
import { addFavoriteProperty } from "../controllers/favouritesController.js";

const router = express.Router();

// Public route
router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);
router.post("/login", loginUser)

//Protected route
router.get("/profile", authenticateToken, (req, res) => {
  res.status(200).json({ message: "Welcome to your profile", user: req.user });
});
router.post("/favorites", authenticateToken, addFavoriteProperty);

export default router;
