// controllers/userController.js
import { UserService } from "../services/userService.js";
import { EmailObserver } from "../observers/emailObserver.js";
import { sendVerificationEmail, sendResetPasswordEmail } from "../utils/email.js";

// Singleton instance
let userServiceInstance = null;

function getUserService() {
  if (!userServiceInstance) {
    userServiceInstance = new UserService();
    
    // Add email observer - this replaces the direct email function calls
    const emailObserver = new EmailObserver({
      sendVerificationEmail,
      sendResetPasswordEmail
    });
    userServiceInstance.addObserver(emailObserver);
  }
  return userServiceInstance;
}

// All controllers maintain EXACT same behavior as original
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userService = getUserService();
    
    const newUser = await userService.register({ username, email, password });

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: newUser,
    });
  } catch (error) {
    console.error("Error registering user:", error.message);
    // EXACT same error handling
    if (error.message === "Email already exists") {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const userService = getUserService();
    
    await userService.verifyEmail(token);

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error.message);
    // EXACT same error handling
    if (error.message === "Invalid or expired token") {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userService = getUserService();
    
    const result = await userService.login({ email, password });

    res.status(200).json({
      message: "Login successful",
      ...result
    });
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(400).json({ message: error.message }); // Always 400 like original
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const userService = getUserService();
    
    await userService.changePassword(userId, { currentPassword, newPassword });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error.message);
    if (error.message === "Current password is incorrect") {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};

export const changeEmail = async (req, res) => {
  try {
    const userId = req.user.id;
   
    const { newEmail } = req.body;
    const userService = getUserService();
    
    await userService.changeEmail(userId, newEmail);

    res.status(200).json({ message: "Email updated successfully. Please verify your new email." });
  } catch (error) {
    console.error("Error changing email:", error.message);
    if (error.message === "Email is already in use") {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const userService = getUserService();
    
    await userService.deleteAccount(userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const userService = getUserService();
    
    await userService.requestPasswordReset(email);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error in forgot password:", error.message);
    if (error.message === "Email not found") {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const userService = getUserService();
    
    await userService.resetPassword({ token, newPassword });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error.message);
    if (error.message === "Invalid or expired token") {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};

export const refreshToken = async (req, res) => {
  try {
    const userId = req.user.id;
    const userService = getUserService();
    
    const result = await userService.refreshToken(userId);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error refreshing token:", error.message);
    if (error.message === "User not found") {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const userService = getUserService();
    
    await userService.resendVerificationEmail(userId);

    res.status(200).json({ message: "Verification email sent successfully" });
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    if (error.message === "User not found") {
      res.status(404).json({ message: error.message });
    } else if (error.message === "Email is already verified") {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
};