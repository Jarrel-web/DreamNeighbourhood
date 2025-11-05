import bcrypt from "bcrypt";
import crypto from "crypto";
import { UserRepository } from "../repositories/userRepository.js";
import { EmailPasswordStrategy } from "../strategies/authStrategy.js";
import { TokenFactory } from "../factories/tokenFactory.js";

export class UserService {
  constructor() {
    this.userRepository = new UserRepository();
    this.authStrategy = new EmailPasswordStrategy(this.userRepository, bcrypt);
    this.observers = [];
  }

  
  addObserver(observer) {
    this.observers.push(observer);
  }

  async notifyObservers(event, data) {
    for (const observer of this.observers) {
      try {
        await observer.update(event, data);
      } catch (error) {
        console.error(`Observer error for event ${event}:`, error);
      }
    }
  }

  async register({ username, email, password }) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      verification_token: verificationToken,
      is_verified: false
    });

    // Notify observers - EXACTLY like original sendVerificationEmail call
    await this.notifyObservers('USER_REGISTERED', {
      email,
      username,
      verificationToken
    });

    return newUser;
  }

  async login({ email, password }) {
    const user = await this.authStrategy.authenticate({ email, password });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // NO email verification check - exactly like original
    const token = TokenFactory.createAuthToken({
      id: user.id,
      email: user.email,
      is_verified: user.is_verified
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_verified: user.is_verified
      }
    };
  }

  async verifyEmail(token) {
    const user = await this.userRepository.findByVerificationToken(token);
    if (!user) {
      throw new Error("Invalid or expired token");
    }

    await this.userRepository.update(user.id, {
      is_verified: true,
      verification_token: null
    });

    return true;
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await this.userRepository.findById(userId);
    
    // EXACT same logic as original
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new Error("Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });

    return true;
  }

  async changeEmail(userId, newEmail) {
    const existingUser = await this.userRepository.findByEmail(newEmail);
    if (existingUser) {
      throw new Error("Email is already in use");
    }

    // EXACT same update as original
    await this.userRepository.update(userId, {
      email: newEmail,
      is_verified: false
    });

    return true;
  }

  async deleteAccount(userId) {
    await this.userRepository.delete(userId);
    return true;
  }

  async requestPasswordReset(email) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Email not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);

    await this.userRepository.update(user.id, {
      reset_token: resetToken,
      reset_token_expiry: expiry.toISOString()
    });

    // Notify observers - EXACTLY like original sendResetPasswordEmail call
    await this.notifyObservers('PASSWORD_RESET_REQUESTED', {
      email: user.email,
      username: user.username,
      resetToken
    });

    return true;
  }

  async resetPassword({ token, newPassword }) {
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      throw new Error("Invalid or expired token");
    }

    // EXACT same expiry logic as original
    const now = new Date();
    const tokenExpiryString = user.reset_token_expiry.endsWith('Z') 
      ? user.reset_token_expiry 
      : user.reset_token_expiry + 'Z';
    const tokenExpiry = new Date(tokenExpiryString);
    
    if (tokenExpiry < now) {
      throw new Error("Invalid or expired token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, {
      password: hashedPassword,
      reset_token: null,
      reset_token_expiry: null
    });

    return true;
  }

  async refreshToken(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const token = TokenFactory.createAuthToken({
      id: user.id,
      email: user.email,
      username: user.username,
      is_verified: user.is_verified
    });

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        is_verified: user.is_verified
      }
    };
  }

  async resendVerificationEmail(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.is_verified) {
      throw new Error("Email is already verified");
    }

    // EXACT same token logic as original
    let verificationToken = user.verification_token;
    if (!verificationToken) {
      verificationToken = crypto.randomBytes(32).toString("hex");
      await this.userRepository.update(userId, {
        verification_token: verificationToken
      });
    }

    await this.notifyObservers('USER_REGISTERED', {
      email: user.email,
      username: user.username,
      verificationToken
    });

    return true;
  }
}