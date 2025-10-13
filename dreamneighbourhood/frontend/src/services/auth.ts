// Simple auth client for users API
export type LoginResponse = { message: string; token: string };
export type RegisterResponse = {
  message: string;
  user: { id: number; username: string; email: string };
};

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = "dn_jwt";

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  let data: any = {};
  try {
    data = await res.json();
  } catch {
    /* empty */
  }

  if (!res.ok) {
    throw new Error(data.message ?? `Request failed: ${res.status}`);
  }

  return data as T;
}


export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/users/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(
  username: string,
  email: string,
  password: string
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/users/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}
export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Auth header generator
 */
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
