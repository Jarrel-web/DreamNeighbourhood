import bcrypt from "bcrypt";
import crypto from "crypto";
import { pool } from "../config/db.js";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from '../utils/email.js';

// Register new user with email verification
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if email exists
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await pool.query(
      `INSERT INTO users (username, email, password, verification_token)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, is_verified`,
      [username, email, hashedPassword, verificationToken]
    );

    // Send verification email
    await sendVerificationEmail(email, username, verificationToken);

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify email endpoint
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const userResult = await pool.query(
      "SELECT * FROM users WHERE verification_token = $1",
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    await pool.query(
      "UPDATE users SET is_verified = true, verification_token = NULL WHERE id = $1",
      [userResult.rows[0].id]
    );

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // JWT token includes verification status
    const token = jwt.sign(
      { id: user.id, email: user.email, is_verified: user.is_verified },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Return username along with token
    res.status(200).json({
    message: "Login successful",
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      is_verified: user.is_verified,
  },
});
  } catch (error) {
    console.error("Error logging in:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

