"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userID, setUserID] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      const decoded = jwtDecode(savedToken);
      setToken(savedToken);
      setUserID(decoded.sub);
      setIsAdmin(decoded.role === "admin");
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    const decoded = jwtDecode(newToken);
    setToken(newToken);
    setIsAdmin(decoded.role === "admin");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUserID(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, isAdmin, userID }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
