import express from "express";
import { 
  registerUser, 
  verifyEmail, 
  loginUser, 
  changePassword, 
  changeEmail, 
  deleteAccount, 
  forgotPassword, 
  resetPassword,
  refreshToken,
  resendVerificationEmail
} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.get("/verify-email", verifyEmail);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/profile", authenticateToken, (req, res) => {
  res.status(200).json({ message: "Welcome to your profile", user: req.user });
});

router.post("/change-password", authenticateToken, changePassword);
router.post("/change-email", authenticateToken, changeEmail);
router.delete("/delete-account", authenticateToken, deleteAccount);
router.post("/refresh-token", authenticateToken, refreshToken);
router.post("/send-verification-email", authenticateToken, resendVerificationEmail);
export default router;