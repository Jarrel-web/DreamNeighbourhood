const TOKEN_KEY = "token";

export function saveToken(token: string): void {
  console.log('💾 saveToken() called with:', token.substring(0, 20) + '...');
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function authHeader(): Record<string, string> {
  const token = getToken();
  console.log('🛡️ authHeader() called, token exists:', !!token);
  
  if (token) {
    return { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` };
  }
  return {};
}