import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return null; // wait until auth status is checked

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
