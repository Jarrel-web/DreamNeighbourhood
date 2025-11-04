import jwt from "jsonwebtoken";

export class TokenFactory {
  static createAuthToken(payload) {
    return jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
  }

  static createVerificationToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  static createResetToken() {
    return crypto.randomBytes(32).toString("hex");
  }
}