"use client";

import React from "react";
import { motion } from "framer-motion";
import { ConvertStringToDate } from "../../../utlis/utils";

export default function BannedComponent({
  bannedUntil,
  isPermanent = false,
  reason = null,
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center"
      >
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
          {isPermanent ? "Account Permanently Banned" : "Account Temporarily Banned"}
        </h1>

        <p className="text-sm sm:text-base text-gray-600 mb-4">
          {`Your account has been ${isPermanent ? "permanently" : "temporarily"} banned.`}
          {bannedUntil && !isPermanent && ` The ban will lift at ${ConvertStringToDate(bannedUntil)}.`}
        </p>

        {reason && (
          <div className="inline-block bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-medium mb-4">
            Reason: {reason}
          </div>
        )}
      </motion.div>
    </main>
  );
}
