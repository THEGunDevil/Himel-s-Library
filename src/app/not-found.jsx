"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">

      {/* Big 404 */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-7xl font-bold text-gray-800"
      >
        404
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-lg text-gray-600 mt-3"
      >
        The page you're looking for does not exist.
      </motion.p>

      {/* Button */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <Link
          href="/"
          className="mt-6 inline-block px-6 py-3 rounded-xl bg-blue-600 text-white text-lg hover:bg-blue-700 transition-all"
        >
          Go Home
        </Link>
      </motion.div>

      {/* Floating animation */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="mt-10 text-gray-400 text-sm"
      >
        Lost in the pages...
      </motion.div>
    </div>
  );
}
