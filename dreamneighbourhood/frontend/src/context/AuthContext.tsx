import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getToken, saveToken, clearToken } from "../services/tokenService";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  email: string;
  username: string; 
  is_verified: boolean;
  exp: number;
}

type AuthContextType = {
  isLoggedIn: boolean;
  username: string | null;
  email: string | null; // Add email field
  isVerified: boolean;
  userId: string | null;
  loginUser: (token: string) => void; // Remove username parameter
  logoutUser: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null); // Add email state
  const [isVerified, setIsVerified] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const decodeAndSetAuth = (token: string) => {
    try {
      console.log('🔓 Decoding token...');
      const decoded = jwtDecode<DecodedToken>(token);
      console.log('✅ Token decoded:', decoded);
      
      setIsLoggedIn(true);
     
      setUsername(decoded.username || decoded.email); 
      setEmail(decoded.email); 
      setIsVerified(decoded.is_verified);
      setUserId(decoded.id);
      
      console.log('✅ Auth state updated:', {
        username: decoded.username || decoded.email, 
        email: decoded.email,
        isVerified: decoded.is_verified,
        userId: decoded.id
      });
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      clearToken();
      setIsLoggedIn(false);
      setUsername(null);
      setEmail(null);
      setIsVerified(false);
      setUserId(null);
    }
  };

  useEffect(() => {
    console.log('🔄 AuthContext initializing...');
    const token = getToken();
    console.log('📋 Token found:', !!token);
    
    if (token) {
      decodeAndSetAuth(token);
    } else {
      console.log('🚫 No token found');
    }
    setLoading(false);
  }, []);

  const loginUser = (token: string) => {
    console.log('🔑 loginUser called:', { token: !!token });
    saveToken(token);
    console.log('✅ Token saved to localStorage:', token);
    decodeAndSetAuth(token);
  };

  const logoutUser = () => {
    console.log('🚪 logoutUser called');
    clearToken();
    setUsername(null);
    setEmail(null);
    setIsVerified(false);
    setUserId(null);
    setIsLoggedIn(false);
    console.log('✅ User logged out');
  };

  return (
    <AuthContext.Provider
      value={{ 
        isLoggedIn, 
        username, 
        email, // Provide email
        isVerified,
        userId,
        loginUser, 
        logoutUser, 
        loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};