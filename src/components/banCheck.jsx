"use client";

import { useAuth } from "@/contexts/authContext";
import BannedComponent from "@/app/banned/page";

export default function BanCheck({ children }) {
  const { user,accessToken } = useAuth();
  if (user?.is_banned) {
    return (
      <BannedComponent
        isBanned={user.is_banned}
        isPermanent={user.is_permanent_ban}
        reason={user.ban_reason}
        bannedUntil={user.ban_until}
        accessToken={accessToken}
        userEmail={user.email}

      />
    );
  }

  // Normal users see the app with header/footer
  return <>{children}</>;
}
