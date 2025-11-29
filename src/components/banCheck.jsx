"use client";

import { useAuth } from "@/contexts/authContext";
import Loader from "./loader";
import BannedComponent from "@/app/banned/page";

export default function BanCheck({ children }) {
  const { user, loading,accessToken } = useAuth();

  // // Show loader while checking auth
  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <Loader />
  //     </div>
  //   );
  // }

  // // If banned, show ONLY the banned page (no header/footer/children)
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
