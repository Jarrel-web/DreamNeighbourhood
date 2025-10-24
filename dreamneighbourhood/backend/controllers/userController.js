import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { sendVerificationEmail, sendResetPasswordEmail } from "../utils/email.js";

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const { data: existingUser } = await pool
      .from("users")
      .select("*")
      .eq("email", email);

    if (existingUser.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const { data: newUser, error: insertError } = await pool
      .from("users")
      .insert([{ username, email, password: hashedPassword, verification_token: verificationToken }])
      .select("id, username, email, is_verified")
      .single();

    if (insertError) throw insertError;

    await sendVerificationEmail(email, username, verificationToken);

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: newUser,
    });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const { data: user, error } = await pool
      .from("users")
      .select("*")
      .eq("verification_token", token)
      .single();

    if (error || !user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const { error: updateError } = await pool
      .from("users")
      .update({ is_verified: true, verification_token: null })
      .eq("id", user.id);

    if (updateError) throw updateError;

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: users, error } = await pool
      .from("users")
      .select("*")
      .eq("email", email);

    if (error) throw error;
    if (users.length === 0) return res.status(400).json({ message: "Invalid credentials" });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, is_verified: user.is_verified },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, email: user.email, is_verified: user.is_verified },
    });
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const { data: user } = await pool
      .from("users")
      .select("password")
      .eq("id", userId)
      .single();

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Current password is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { error } = await pool
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", userId);

    if (error) throw error;

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const changeEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newEmail } = req.body;

    const { data: existing } = await pool
      .from("users")
      .select("id")
      .eq("email", newEmail);

    if (existing.length > 0)
      return res.status(400).json({ message: "Email is already in use" });

    const { error } = await pool
      .from("users")
      .update({ email: newEmail, is_verified: false })
      .eq("id", userId);

    if (error) throw error;

    res.status(200).json({ message: "Email updated successfully. Please verify your new email." });
  } catch (error) {
    console.error("Error changing email:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = await pool
      .from("users")
      .delete()
      .eq("id", userId);

    if (error) throw error;

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const { data: user } = await pool
      .from("users")
      .select("id, username")
      .eq("email", email)
      .single();

    if (!user) return res.status(400).json({ message: "Email not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1); // 1 hour expiry

    // Convert to UTC before storing
    const expiryUTC = expiry.toISOString();


    // Store token & expiry in DB as UTC
    const { error } = await pool
      .from("users")
      .update({ 
        reset_token: resetToken, 
        reset_token_expiry: expiryUTC
      })
      .eq("id", user.id);

    if (error) throw error;

    // Send email with reset link
    await sendResetPasswordEmail(email, user.username, resetToken);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    console.log("Reset password request with token:", token);

    const { data: user } = await pool
      .from("users")
      .select("id, reset_token, reset_token_expiry")
      .eq("reset_token", token)
      .single();

    

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const now = new Date();
    
    // Explicitly parse the expiry as UTC by adding 'Z' to the string
    const tokenExpiryString = user.reset_token_expiry.endsWith('Z') 
      ? user.reset_token_expiry 
      : user.reset_token_expiry + 'Z';
    const tokenExpiry = new Date(tokenExpiryString);
    
    

    if (tokenExpiry < now) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { error } = await pool
      .from("users")
      .update({ 
        password: hashedPassword, 
        reset_token: null, 
        reset_token_expiry: null 
      })
      .eq("id", user.id);

    if (error) throw error;

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};