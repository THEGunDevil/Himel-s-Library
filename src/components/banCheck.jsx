"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/authContext";
import BannedComponent from "@/app/banned/page";

export default function BanCheck() {
  const router = useRouter();
  const { user = {}, loading } = useAuth();
  const pathname = usePathname();

  // Wait for loading to finish
  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (pathname !== "/banned" && user?.is_banned) {
      router.push("/banned");
    }
  }, [user, loading, pathname, router]);

  if (loading) return null; // or a spinner

  if (user?.is_banned) {
    return (
      <BannedComponent
        reason={user?.ban_reason}
        isPermanent={user?.is_permanent}
      />
    );
  }

  return null;
}

