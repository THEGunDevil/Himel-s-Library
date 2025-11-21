"use client";

import { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard"); // change this to where you want
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-gray-600">
        Your subscription is now active. Redirecting you…
      </p>
    </div>
  );
}
