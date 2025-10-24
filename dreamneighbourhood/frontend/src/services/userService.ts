import { apiRequest } from './apiClient';
import { authHeader } from './tokenService';

export type ChangePasswordResponse = { message: string };
export type ChangeEmailResponse = { message: string };
export type DeleteAccountResponse = { message: string };
export type UserProfileResponse = {
  user: {
    id: string;
    username: string;
    email: string;
    is_verified: boolean;
    created_at: string;
  };
};

// User management functions (require authentication)
export async function changePassword(currentPassword: string, newPassword: string): Promise<ChangePasswordResponse> {
  return apiRequest<ChangePasswordResponse>("/users/change-password", {
    method: "POST",
    headers: { ...authHeader() },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function changeEmail(newEmail: string): Promise<ChangeEmailResponse> {
  return apiRequest<ChangeEmailResponse>("/users/change-email", {
    method: "POST",
    headers: { ...authHeader() },
    body: JSON.stringify({ newEmail }),
  });
}

export async function deleteAccount(): Promise<DeleteAccountResponse> {
  return apiRequest<DeleteAccountResponse>("/users/delete-account", {
    method: "DELETE",
    headers: { ...authHeader() },
  });
}

export async function getUserProfile(): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>("/users/profile", {
    headers: { ...authHeader() },
  });
}

// Future user management functions can go here
export async function updateProfile(username: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/users/profile", {
    method: "PUT",
    headers: { ...authHeader() },
    body: JSON.stringify({ username }),
  });
}