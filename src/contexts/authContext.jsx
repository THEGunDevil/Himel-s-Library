"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [userID, setUserID] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const login = (token) => {
    setAccessToken(token);
  };
  // Decode token whenever it changes
  useEffect(() => {
    if (accessToken) {
      const decoded = jwtDecode(accessToken);
      setUserID(decoded.sub);
      setIsAdmin(decoded.role === "admin");
    } else {
      setUserID(null);
      setIsAdmin(false);
    }
  }, [accessToken]);
  // Refresh access token from cookie
  const refreshToken = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {
        },
        { withCredentials: true }
      );
      setAccessToken(response.data.access_token);
      return response.data.access_token;
    } catch (err) {
      setAccessToken(null);
      setUserID(null);
      setIsAdmin(false);
      return null;
    }
  };

  // Initialize auth on page load
  useEffect(() => {
    const initAuth = async () => {
      const token = await refreshToken();
      if (token) {
        const decoded = jwtDecode(token);
        setUserID(decoded.sub);
        setIsAdmin(decoded.role === "admin");
      }
    };
    initAuth();
  }, []);

  const logout = async () => {
    setAccessToken(null);
    setUserID(null);
    setIsAdmin(false);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ accessToken, login, logout, isAdmin, userID, refreshToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
