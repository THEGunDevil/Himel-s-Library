"use client";
import { createContext, useContext, useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode"; // remove curly braces
import axios from "axios";
import { useSingleUserData } from "@/hooks/useSingleUserData";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [userID, setUserID] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null); // initialize as null
  const [authLoading, setAuthLoading] = useState(true); // track overall auth loading
  const { data, loading: userLoading, error } = useSingleUserData(userID, accessToken);

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
        {},
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
      setAuthLoading(true);
      try {
        const token = await refreshToken(); // sends cookie
        if (token) {
          setAccessToken(token);
        }
      } catch {
        setAccessToken(null);
        setUserID(null);
        setIsAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    };
    initAuth();
  }, []);

  // Update user state when data from hook changes
  useEffect(() => {
    if (data) setUser(data);
    else setUser(null);
  }, [data]);

  const logout = async () => {
    setAccessToken(null);
    setUserID(null);
    setIsAdmin(false);
    setUser(null);
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
      value={{
        accessToken,
        login,
        logout,
        isAdmin,
        userID,
        refreshToken,
        user,
        loading: authLoading || userLoading, // combined loading
        error,
      }}
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
