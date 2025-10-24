import { apiRequest } from './apiClient';

// Response types
export type LoginResponse = {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    is_verified: boolean;
  };
};

export type RegisterResponse = {
  message: string;
  user: { id: number; username: string; email: string };
};

export type ForgotPasswordResponse = { message: string };
export type ResetPasswordResponse = { message: string };

// Core authentication functions only
export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(username: string, email: string, password: string): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/users/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

// Password reset (public routes - no auth required)
export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return apiRequest<ForgotPasswordResponse>("/users/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
  return apiRequest<ResetPasswordResponse>("/users/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
}