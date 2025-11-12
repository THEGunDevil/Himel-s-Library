"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ConvertStringToDate } from "../../../utlis/utils";

export default function BannedComponent({
  bannedUntil,
  isPermanent = false,
  reason = null,
}) {

  const [timeLeft, setTimeLeft] = useState("");

  // Calculate time remaining for temporary bans
  useEffect(() => {
    if (!bannedUntil || isPermanent) return;

    const interval = setInterval(() => {
      const now = new Date();
      const end = new Date(bannedUntil);
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Ban has expired. Refreshing...");
        clearInterval(interval);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [bannedUntil, isPermanent]);


  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center"
      >
        {/* Ban Icon */}
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          {isPermanent ? "Account Permanently Banned" : "Account Temporarily Suspended"}
        </h1>

        <p className="text-sm sm:text-base text-gray-600 mb-6">
          {isPermanent 
            ? "Your account has been permanently banned and cannot be accessed."
            : "Your account is temporarily suspended."}
        </p>

        {/* Ban Reason */}
        {reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-red-800 mb-1">Reason:</p>
            <p className="text-red-700">{reason}</p>
          </div>
        )}

        {/* Time Remaining (Temporary Ban) */}
        {!isPermanent && bannedUntil && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-blue-800 mb-1">Ban Expires:</p>
            <p className="text-blue-700 font-semibold">{ConvertStringToDate(bannedUntil)}</p>
            {timeLeft && (
              <p className="text-2xl font-bold text-blue-900 mt-2">{timeLeft}</p>
            )}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-6">
          If you believe this is a mistake, please contact support.
        </p>
      </motion.div>
    </main>
  );
}