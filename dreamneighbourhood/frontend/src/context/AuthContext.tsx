import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { getToken, saveToken, clearToken } from "../services/tokenService";

type AuthContextType = {
  isLoggedIn: boolean;
  username: string | null;
  loginUser: (token: string, username: string) => void;
  logoutUser: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      setIsLoggedIn(true);
      const storedUsername = localStorage.getItem("username");
      if (storedUsername) setUsername(storedUsername);
    }
    setLoading(false);
  }, []);

  const loginUser = (token: string, username: string) => {
    saveToken(token);
    if (username) localStorage.setItem("username", username);
    setUsername(username);
    setIsLoggedIn(true);
  };

  const logoutUser = () => {
    clearToken();
    localStorage.removeItem("username");
    setUsername(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, username, loginUser, logoutUser, loading }}
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
