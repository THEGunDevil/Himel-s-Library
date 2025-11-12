"use client";

import { AuthProvider } from "@/contexts/authContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "./header";
import BanCheck from "./banCheck";
import ToastProvider from "./toastProvider";
import Footer from "./footer";
import { useState } from "react";

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

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BanCheck>
          {/* Header and Footer only show for non-banned users */}
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </BanCheck>
        <ToastProvider />
      </AuthProvider>
    </QueryClientProvider>
  );
}