"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/contexts/authContext";

const SuccessContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { accessToken, userID } = useAuth();
  const tranId = searchParams.get("tran_id");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Finalizing your subscription...");

  useEffect(() => {
    const finalize = async () => {
      try {
        // Optional: refresh user data so dashboard shows the subscription instantly
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/subscription/${userID}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        console.log(res);
        
        if (res.ok) {
          setStatus("success");
          setMessage("Payment successful! Your subscription is now active.");
        } else {
          throw new Error("Failed to load user");
        }
      } catch (err) {
        // Even if fetch fails, we still show success because backend already processed it
        setStatus("success");
        setMessage("Payment successful! You can now access your subscription.");
      }
    };

    // Tiny delay for nice spinner
    const timer = setTimeout(finalize, 800);

    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-inter">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center border border-gray-100">
        {status === "loading" && (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Processing...</h2>
            <p className="text-gray-500 mt-2">{message}</p>
            {tranId && (
              <p className="text-xs text-gray-400 mt-4">
                Transaction ID: {tranId.substring(0, 16)}...
              </p>
            )}
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <div className="p-3 bg-green-100 rounded-full mb-4 shadow-md">
              <CheckCircle className="w-20 h-20 text-green-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mt-3 text-lg">{message}</p>
            {tranId && (
              <p className="text-sm text-gray-500 mt-4">
                Transaction ID: {tranId}
              </p>
            )}
            <button
              onClick={() => router.push("/")}
              className="mt-8 w-full bg-green-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
            >
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const PaymentSuccessPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">
          Loading...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
};

export default PaymentSuccessPage;
