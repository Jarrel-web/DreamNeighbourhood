// Simple auth client for users API
export type LoginResponse = { message: string; token: string };
export type RegisterResponse = {
  message: string;
  user: { id: number; username: string; email: string };
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? "Login failed");
  }
  return res.json();
}

export async function register(
  username: string,
  email: string,
  password: string
): Promise<RegisterResponse> {
  const res = await fetch(`${API_BASE}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? "Registration failed");
  }
  return res.json();
}

export function saveToken(token: string) {
  localStorage.setItem("dn_jwt", token);
}

export function getToken(): string | null {
  return localStorage.getItem("dn_jwt");
}

export function clearToken() {
  localStorage.removeItem("dn_jwt");
}

export function authHeader(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}


// export async function sendVerificationEmail(
//   email: string
// ): Promise<{ message: string }> {
//   const res = await fetch(`${API_BASE}/users/verify-email/send`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email }),
//   });
//   if (!res.ok) {
//     const error = await res.json().catch(() => ({}));
//     throw new Error(error.message ?? "Failed to send verification email");
//   }
//   return res.json();
// }
