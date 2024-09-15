import React from "react";
import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const { loggedIn } = useAuth();

  if (!loggedIn) {
    return <Navigate to="/" />;
  }

  return children;
}
