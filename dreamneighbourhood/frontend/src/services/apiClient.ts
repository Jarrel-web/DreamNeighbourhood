const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest<T>(
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