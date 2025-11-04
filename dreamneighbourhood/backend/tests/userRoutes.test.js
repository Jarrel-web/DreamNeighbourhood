import request from 'supertest';

// Mock everything BEFORE importing app
jest.mock('../config/db.js', () => ({
  pool: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis()
    }))
  }
}));

jest.mock('../utils/email.js', () => ({
  sendVerificationEmail: jest.fn(() => Promise.resolve()),
  sendResetPasswordEmail: jest.fn(() => Promise.resolve())
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashedPassword')),
  compare: jest.fn(() => Promise.resolve(true))
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token')
}));

jest.mock('../middleware/auth.js', () => ({
  authenticateToken: jest.fn((req, res, next) => {
    req.user = { 
      id: 'mock-user-id', 
      email: 'test@example.com',
      username: 'testuser'
    };
    next();
  })
}));

// Now import app and other modules
import app from '../app.js';
import { pool } from '../config/db.js';
import { sendVerificationEmail, sendResetPasswordEmail } from '../utils/email.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Suppress console.error and console.log during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
  console.log.mockRestore();
});

describe('User Routes API Tests', () => {
  let mockDbChain;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create a fresh mock chain for each test
    mockDbChain = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      data: null,
      error: null
    };

    pool.from.mockReturnValue(mockDbChain);
    
    // Reset mock implementations
    bcrypt.hash.mockResolvedValue('hashedPassword');
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mock-jwt-token');
    sendVerificationEmail.mockResolvedValue();
    sendResetPasswordEmail.mockResolvedValue();
  });

  describe('POST /api/v1/users/register', () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    it('should register a new user successfully', async () => {
      // Mock no existing user
      mockDbChain.data = [];
      
      // Mock successful insertion
      const newUser = { 
        id: 1, 
        username: 'testuser', 
        email: 'test@example.com', 
        is_verified: false 
      };
      mockDbChain.data = newUser;
      mockDbChain.error = null;

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully. Please verify your email.');
      expect(response.body.user).toEqual(newUser);
      expect(sendVerificationEmail).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should return 400 if email already exists', async () => {
      // Mock existing user
      mockDbChain.data = [{ id: 1, email: 'test@example.com' }];

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Email already exists');
    });

    it('should return 500 on database error', async () => {
      // Mock no existing user but insertion error
      mockDbChain.data = [];
      mockDbChain.error = { message: 'Database connection failed' };

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(userData)
        .expect(500);

      expect(response.body.message).toBe('Server error');
      expect(response.body.error).toBe('Database connection failed');
    });
  });

  describe('GET /api/v1/users/verify-email', () => {
    it('should verify email with valid token', async () => {
      const token = 'valid-verification-token';
      mockDbChain.data = { id: 1, verification_token: token };
      mockDbChain.error = null;

      const response = await request(app)
        .get('/api/v1/users/verify-email')
        .query({ token })
        .expect(200);

      expect(response.body.message).toBe('Email verified successfully');
    });

    it('should return 400 for invalid verification token', async () => {
      const token = 'invalid-token';
      // For "user not found" scenario, we need data: null and NO error
      mockDbChain.data = null;
      mockDbChain.error = null; // No database error, just no user found

      const response = await request(app)
        .get('/api/v1/users/verify-email')
        .query({ token })
        .expect(400);

      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('should return 500 on database error during verification', async () => {
      const token = 'valid-token';
      // For database error scenario, we need an error object
      mockDbChain.data = null;
      mockDbChain.error = { message: 'Database connection failed' };

      const response = await request(app)
        .get('/api/v1/users/verify-email')
        .query({ token })
        .expect(500);

      expect(response.body.message).toBe('Server error');
    });
  });

  describe('POST /api/v1/users/login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    it('should login user with valid credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        username: 'testuser',
        is_verified: true
      };

      mockDbChain.data = [mockUser];
      mockDbChain.error = null;

      const response = await request(app)
        .post('/api/v1/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBe('mock-jwt-token');
      expect(response.body.user).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        is_verified: true
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should return 400 for non-existent email', async () => {
      mockDbChain.data = [];
      mockDbChain.error = null;

      const response = await request(app)
        .post('/api/v1/users/login')
        .send(loginData)
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 400 for incorrect password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        username: 'testuser',
        is_verified: true
      };

      mockDbChain.data = [mockUser];
      bcrypt.compare.mockResolvedValue(false);

      const response = await request(app)
        .post('/api/v1/users/login')
        .send(loginData)
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 500 on database error during login', async () => {
      mockDbChain.data = [];
      mockDbChain.error = { message: 'Database error' };

      const response = await request(app)
        .post('/api/v1/users/login')
        .send(loginData)
        .expect(500);

      expect(response.body.message).toBe('Server error');
    });
  });

  describe('POST /api/v1/users/forgot-password', () => {
    it('should send reset password email for existing user', async () => {
      const emailData = { email: 'test@example.com' };
      const mockUser = { id: 1, username: 'testuser' };

      mockDbChain.data = mockUser;
      mockDbChain.error = null;

      const response = await request(app)
        .post('/api/v1/users/forgot-password')
        .send(emailData)
        .expect(200);

      expect(response.body.message).toBe('Password reset email sent');
      expect(sendResetPasswordEmail).toHaveBeenCalled();
    });

    it('should return 400 for non-existent email', async () => {
      const emailData = { email: 'nonexistent@example.com' };
      mockDbChain.data = null;
      mockDbChain.error = null; // No database error, just no user found

      const response = await request(app)
        .post('/api/v1/users/forgot-password')
        .send(emailData)
        .expect(400);

      expect(response.body.message).toBe('Email not found');
    });

    it('should return 500 on database error', async () => {
      const emailData = { email: 'test@example.com' };
      mockDbChain.data = null;
      mockDbChain.error = { message: 'Database connection failed' };

      const response = await request(app)
        .post('/api/v1/users/forgot-password')
        .send(emailData)
        .expect(500);

      expect(response.body.message).toBe('Server error');
    });
  });

  describe('POST /api/v1/users/reset-password', () => {
    const resetData = {
      token: 'valid-reset-token',
      newPassword: 'newpassword123'
    };

    it('should reset password with valid token', async () => {
      const mockUser = {
        id: 1,
        reset_token: 'valid-reset-token',
        reset_token_expiry: new Date(Date.now() + 3600000).toISOString()
      };

      mockDbChain.data = mockUser;
      mockDbChain.error = null;

      const response = await request(app)
        .post('/api/v1/users/reset-password')
        .send(resetData)
        .expect(200);

      expect(response.body.message).toBe('Password reset successfully');
      expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
    });

    it('should return 400 for expired reset token', async () => {
      const mockUser = {
        id: 1,
        reset_token: 'expired-token',
        reset_token_expiry: new Date(Date.now() - 3600000).toISOString()
      };

      mockDbChain.data = mockUser;
      mockDbChain.error = null;

      const response = await request(app)
        .post('/api/v1/users/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('should return 400 for invalid reset token', async () => {
      mockDbChain.data = null;
      mockDbChain.error = null; // No database error, just no user found

      const response = await request(app)
        .post('/api/v1/users/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body.message).toBe('Invalid or expired token');
    });

    it('should return 500 on database error during password reset', async () => {
      const mockUser = {
        id: 1,
        reset_token: 'valid-reset-token',
        reset_token_expiry: new Date(Date.now() + 3600000).toISOString()
      };

      mockDbChain.data = mockUser;
      mockDbChain.error = { message: 'Update failed' };

      const response = await request(app)
        .post('/api/v1/users/reset-password')
        .send(resetData)
        .expect(500);

      expect(response.body.message).toBe('Server error');
    });
  });

  describe('Protected Routes', () => {
    describe('GET /api/v1/users/profile', () => {
      it('should return user profile', async () => {
        const response = await request(app)
          .get('/api/v1/users/profile')
          .expect(200);

        expect(response.body.message).toBe('Welcome to your profile');
        expect(response.body.user).toEqual({
          id: 'mock-user-id',
          email: 'test@example.com',
          username: 'testuser'
        });
      });
    });

    describe('POST /api/v1/users/change-password', () => {
      it('should change password with correct current password', async () => {
        const passwordData = {
          currentPassword: 'oldpassword',
          newPassword: 'newpassword'
        };

        const mockUser = { password: 'hashedOldPassword' };
        mockDbChain.data = mockUser;
        mockDbChain.error = null;

        const response = await request(app)
          .post('/api/v1/users/change-password')
          .send(passwordData)
          .expect(200);

        expect(response.body.message).toBe('Password updated successfully');
        expect(bcrypt.compare).toHaveBeenCalledWith('oldpassword', 'hashedOldPassword');
        expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      });

      it('should return 400 for incorrect current password', async () => {
        const passwordData = {
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword'
        };

        const mockUser = { password: 'hashedOldPassword' };
        mockDbChain.data = mockUser;
        bcrypt.compare.mockResolvedValue(false);

        const response = await request(app)
          .post('/api/v1/users/change-password')
          .send(passwordData)
          .expect(400);

        expect(response.body.message).toBe('Current password is incorrect');
      });

      it('should return 500 on database error during password change', async () => {
        const passwordData = {
          currentPassword: 'oldpassword',
          newPassword: 'newpassword'
        };

        const mockUser = { password: 'hashedOldPassword' };
        mockDbChain.data = mockUser;
        mockDbChain.error = { message: 'Update failed' };

        const response = await request(app)
          .post('/api/v1/users/change-password')
          .send(passwordData)
          .expect(500);

        expect(response.body.message).toBe('Server error');
      });
    });

    describe('POST /api/v1/users/change-email', () => {
      it('should change email successfully', async () => {
        const emailData = { newEmail: 'newemail@example.com' };
        mockDbChain.data = []; // No existing user with this email
        mockDbChain.error = null;

        const response = await request(app)
          .post('/api/v1/users/change-email')
          .send(emailData)
          .expect(200);

        expect(response.body.message).toBe('Email updated successfully. Please verify your new email.');
      });

      it('should return 400 if new email is already in use', async () => {
        const emailData = { newEmail: 'existing@example.com' };
        mockDbChain.data = [{ id: 2 }]; // Existing user with this email
        mockDbChain.error = null;

        const response = await request(app)
          .post('/api/v1/users/change-email')
          .send(emailData)
          .expect(400);

        expect(response.body.message).toBe('Email is already in use');
      });

      it('should return 500 on database error during email change', async () => {
        const emailData = { newEmail: 'newemail@example.com' };
        mockDbChain.data = [];
        mockDbChain.error = { message: 'Update failed' };

        const response = await request(app)
          .post('/api/v1/users/change-email')
          .send(emailData)
          .expect(500);

        expect(response.body.message).toBe('Server error');
      });
    });

    describe('DELETE /api/v1/users/delete-account', () => {
      it('should delete user account', async () => {
        mockDbChain.error = null;

        const response = await request(app)
          .delete('/api/v1/users/delete-account')
          .expect(200);

        expect(response.body.message).toBe('Account deleted successfully');
      });

      it('should return 500 on deletion error', async () => {
        mockDbChain.error = { message: 'Deletion failed' };

        const response = await request(app)
          .delete('/api/v1/users/delete-account')
          .expect(500);

        expect(response.body.message).toBe('Server error');
      });
    });

    describe('POST /api/v1/users/refresh-token', () => {
      it('should refresh JWT token', async () => {
        const mockUser = {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          is_verified: true
        };

        mockDbChain.data = mockUser;
        mockDbChain.error = null;

        const response = await request(app)
          .post('/api/v1/users/refresh-token')
          .expect(200);

        expect(response.body.token).toBe('mock-jwt-token');
        expect(response.body.user).toEqual({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          is_verified: true
        });
      });

      it('should return 404 if user not found', async () => {
        mockDbChain.data = null;
        mockDbChain.error = null; // No database error, just no user found

        const response = await request(app)
          .post('/api/v1/users/refresh-token')
          .expect(404);

        expect(response.body.message).toBe('User not found');
      });

      it('should return 500 on database error during token refresh', async () => {
        mockDbChain.data = null;
        mockDbChain.error = { message: 'Database error' };

        const response = await request(app)
          .post('/api/v1/users/refresh-token')
          .expect(500);

        expect(response.body.message).toBe('Server error');
      });
    });

    describe('POST /api/v1/users/send-verification-email', () => {
      it('should resend verification email for unverified user', async () => {
        const mockUser = {
          email: 'test@example.com',
          username: 'testuser',
          verification_token: 'existing-token',
          is_verified: false
        };

        mockDbChain.data = mockUser;
        mockDbChain.error = null;

        const response = await request(app)
          .post('/api/v1/users/send-verification-email')
          .expect(200);

        expect(response.body.message).toBe('Verification email sent successfully');
      });

      it('should generate new token if none exists and resend verification email', async () => {
        const mockUser = {
          email: 'test@example.com',
          username: 'testuser',
          verification_token: null,
          is_verified: false
        };

        mockDbChain.data = mockUser;
        mockDbChain.error = null;

        const response = await request(app)
          .post('/api/v1/users/send-verification-email')
          .expect(200);

        expect(response.body.message).toBe('Verification email sent successfully');
      });

      it('should return 400 if email is already verified', async () => {
        const mockUser = {
          email: 'test@example.com',
          username: 'testuser',
          is_verified: true
        };

        mockDbChain.data = mockUser;
        mockDbChain.error = null;

        const response = await request(app)
          .post('/api/v1/users/send-verification-email')
          .expect(400);

        expect(response.body.message).toBe('Email is already verified');
      });

      it('should return 404 if user not found', async () => {
        mockDbChain.data = null;
        mockDbChain.error = null; // No database error, just no user found

        const response = await request(app)
          .post('/api/v1/users/send-verification-email')
          .expect(404);

        expect(response.body.message).toBe('User not found');
      });

      it('should return 500 on database error during verification email resend', async () => {
        const mockUser = {
          email: 'test@example.com',
          username: 'testuser',
          verification_token: 'existing-token',
          is_verified: false
        };

        mockDbChain.data = mockUser;
        mockDbChain.error = { message: 'Update failed' };

        const response = await request(app)
          .post('/api/v1/users/send-verification-email')
          .expect(500);

        expect(response.body.message).toBe('Server error');
      });
    });
  });
});