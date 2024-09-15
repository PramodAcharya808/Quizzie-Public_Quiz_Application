import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import apiClient from "../utils/apiClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(
    () => !!localStorage.getItem("token")
  );
  const [loading, setLoading] = useState(false);

  const setLoadingState = (state) => {
    setLoading(state);
  };

  const login = (data) => {
    localStorage.setItem("token", data.accessToken); // Store the JWT in localStorage
    setLoggedIn(true);
  };

  const logout = async () => {
    try {
      await apiClient.post(
        "/user/logout",
        null,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
        // { withCredentials: true }
      );
      localStorage.removeItem("token"); // Remove the token from localStorage
      setLoggedIn(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const recheckAuthentication = () => {
      const isAuthenticatedResult = !!localStorage.getItem("token");
      setLoggedIn(isAuthenticatedResult);
    };

    recheckAuthentication();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loggedIn,
        login,
        logout,
        loading,
        setLoadingState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
