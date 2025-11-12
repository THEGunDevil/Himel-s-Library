"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRightFromCircleIcon, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { ConvertStringToDate } from "../../../utils/utils";
import { toast } from "react-toastify";

export default function BannedComponent({
  bannedUntil,
  isPermanent = false,
  reason = null,
  accessToken,
  userEmail = "",
}) {
  const [timeLeft, setTimeLeft] = useState("");
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    if (!accessToken) return;
    setSending(true);

    const data = {
      name: formData.user_name,
      email: formData.user_email,
      subject: formData.subject,
      message: formData.message,
    };

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/contact/send`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      toast.success("Email sent successfully");
    } catch (error) {
      toast.error("There was an issue sending the email");
      console.error("❌ Email error:", error.response?.data || error.message);
    } finally {
      setSending(false);
    }
  };

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
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
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
          {isPermanent
            ? "Account Permanently Banned"
            : "Account Temporarily Suspended"}
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

        {/* Time Remaining for Temporary Ban */}
        {!isPermanent && bannedUntil && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-blue-800 mb-1">Ban Expires:</p>
            <p className="text-blue-700 font-semibold">
              {ConvertStringToDate(bannedUntil)}
            </p>
            {timeLeft && (
              <p className="text-2xl font-bold text-blue-900 mt-2">{timeLeft}</p>
            )}
          </div>
        )}

        {/* Contact Support Prompt */}
        <p className="text-xs w-full text-gray-500 mt-6 flex flex-col md:flex-row justify-center md:items-center items-start mx-auto">
          <span>If you believe this is a mistake, please</span>
          {bannedUntil && (
            <span
              className="flex items-center whitespace-nowrap cursor-pointer md:text-gray-500 text-blue-500 hover:text-blue-500 md:ml-1"
              onClick={() => setOpen((prev) => !prev)}
            >
              contact support
              <ArrowUpRightFromCircleIcon className="h-3 ml-1" />
            </span>
          )}
        </p>

        {/* Contact Form Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col space-y-4 md:p-6 p-4 border rounded md:mt-4 mt-2 border-gray-200 bg-white"
              >
                <input
                  type="text"
                  placeholder="Your Name"
                  {...register("user_name", { required: "Name is required" })}
                  className="w-full bg-transparent border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none py-2 text-sm md:text-base"
                />
                {errors.user_name && (
                  <p className="text-red-500 text-sm">{errors.user_name.message}</p>
                )}

                <input
                  type="text"
                  placeholder="Subject"
                  {...register("subject", { required: "Subject is required" })}
                  className="w-full bg-transparent border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none py-2 text-sm md:text-base"
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm">{errors.subject.message}</p>
                )}

                <input
                  type="email"
                  readOnly
                  defaultValue={userEmail}
                  {...register("user_email")}
                  className="w-full outline-0 bg-gray-100 cursor-not-allowed border-b-2 border-gray-300 text-gray-500 py-2 text-sm md:text-base"
                />

                <textarea
                  placeholder="Your Message"
                  rows={4}
                  {...register("message", { required: "Message is required" })}
                  className="w-full bg-transparent border-b-2 border-gray-300 focus:border-blue-500 focus:outline-none py-2 resize-none text-sm md:text-base"
                />
                {errors.message && (
                  <p className="text-red-500 text-sm">{errors.message.message}</p>
                )}

                <button
                  type="submit"
                  disabled={!userEmail || sending}
                  className="mt-2 flex group cursor-pointer text-gray-500 hover:text-blue-500 items-center gap-1.5 w-fit mx-auto py-1 px-4 font-semibold border-b-3 border-b-gray-500 hover:border-b-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? "Sending..." : "Send Email"}
                  <Send size={17} className="text-gray-500 group-hover:text-blue-500" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}
