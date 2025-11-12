"use client";

import { useAuth } from "@/contexts/authContext";
import Loader from "./loader";
import BannedComponent from "@/app/banned/page";

export default function BanCheck({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  // If banned, render banned page only
  if (user?.is_banned) {

    return (
      <BannedComponent
        isBanned={user?.is_banned}
        isPermanent={user?.is_permanent_ban}
        reason={user?.ban_reason}
        bannedUntil={user?.ban_until}
      />
    );
  }

  // Normal users see the app
  return children;
}
