"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) setToken(savedToken);
  }, []);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken); // 🔥 triggers re-render
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null); // 🔥 triggers re-render
  };
  const decoded = token && typeof token === "string" ? jwtDecode(token) : null;
  const isAdmin = decoded?.role === "admin"; // optional chaining prevents errors

  return (
    <AuthContext.Provider value={{ token, login, logout, isAdmin}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
