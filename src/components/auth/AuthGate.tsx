import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const AuthGate: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (user?.mustChangePassword) {
    if (location.pathname !== "/reset-password") {
      return <Navigate to="/reset-password" replace />;
    }
  }

  return <Outlet />;
};

export default AuthGate;
