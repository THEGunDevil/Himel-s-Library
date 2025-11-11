"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BannedComponent({
  title = "Account Permanently Banned",
  isPermanent = false,
  message = "Your account has been permanently banned for violating our terms of service. If you believe this is a mistake, you can contact support or request a review.",
  reason = null,
  contactHref = "/contact",
}) {
  const router = useRouter();
  useEffect(() => {
    try {
      router.push("/logout");
    } catch (err) {
      console.error("Logging out failed.",err);
    }
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center"
        role="region"
        aria-labelledby="banned-title"
      >
        <div className="mx-auto w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-red-600"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 2a10 10 0 100 20 10 10 0 000-20z"
              stroke="currentColor"
              strokeWidth="1.5"
              opacity="0.15"
            />
            <path
              d="M15 9l-6 6M9 9l6 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1
          id="banned-title"
          className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2"
        >
          {title}
        </h1>

        <p className="text-sm sm:text-base text-gray-600 mb-4">{message}</p>

        {reason && (
          <div className="inline-block bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
            Reason: {reason}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-center">
          {isPermanent && (
            <Link
              href={"/"}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium shadow-sm hover:shadow-md transition"
              aria-label="Back to Home"
            >
              Go to homepage
            </Link>
          )}

          <Link
            href={contactHref}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white text-sm font-medium border border-red-600 text-red-600 hover:bg-red-50 transition"
            aria-label="Contact Support"
          >
            Contact support
          </Link>
        </div>

        <p className="mt-6 text-xs text-gray-400">
          If you need additional help, please include your account email and any
          relevant details when contacting support.
        </p>
      </motion.div>
    </main>
  );
}
