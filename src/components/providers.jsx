"use client";

import { AuthProvider } from "@/contexts/authContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "./header";
import BanCheck from "./banCheck";
import ToastProvider from "./toastProvider";
import Footer from "./footer";
import { useState } from "react";
import { useEffect } from "react";
import { ThemeToggleButton } from "./ui/shadcn-io/theme-toggle-button";

export default function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  const [theme, setTheme] = useState("light");

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BanCheck>
          {/* Header and Footer only show for non-banned users */}
          <Header />
          <div className="fixed top-24 sm:top-[116px] right-4 z-10">
            <ThemeToggleButton theme={theme} onClick={toggleTheme} variant="circle-blur" start="top-right"/>
          </div>
          <main className="min-h-screen">{children}</main>
          <Footer />
        </BanCheck>
        <ToastProvider />
      </AuthProvider>
    </QueryClientProvider>
  );
}
