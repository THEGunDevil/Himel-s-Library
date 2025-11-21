'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; 
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Core component that handles the logic and UI
const SuccessContent = () => {
  // Next.js App Router Hooks
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Extract the transaction ID from the URL query parameters (e.g., ?tran_id=...)
  const tranId = searchParams.get('tran_id');

  const [status, setStatus] = useState('loading'); // loading | success | failed | manual_check
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    // 1. Initial check for transaction ID
    if (!tranId) {
      setStatus('failed');
      setMessage('No transaction ID found in the URL. Cannot verify payment.');
      return;
    }

    let intervalId;
    let attempts = 0;
    const maxAttempts = 10; // Max polling time: 20 seconds

    // 2. Polling function to check backend status
    const checkStatus = async () => {
      try {
        attempts++;
        // IMPORTANT: Ensure NEXT_PUBLIC_API_URL is correctly set in your .env file
        const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/stripe/callback?tran_id=${tranId}`;
        
        const response = await fetch(API_URL);
        const data = await response.json();

        if (response.ok && data.status === 'paid') {
          // Success case: Payment confirmed by backend webhook
          setStatus('success');
          setMessage('Payment confirmed! Your subscription is active.');
          clearInterval(intervalId);
        } else if (attempts >= maxAttempts) {
          // Manual Check case: Max attempts reached without confirmation
          setStatus('manual_check');
          setMessage('Payment status is delayed. Please check your dashboard in a moment.');
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      }
    };

    // Start polling immediately, then repeat every 2 seconds
    checkStatus();
    intervalId = setInterval(checkStatus, 2000);

    // Cleanup function to stop the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [tranId]); // Re-run effect if tranId changes (shouldn't happen on this page)

  // Navigation function using Next.js router
  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 font-inter">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center transform transition-all duration-500 hover:scale-[1.01] border border-gray-100">
        
        {/* State Display Logic */}
        
        {/* LOADING STATE */}
        {status === 'loading' && (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Processing Payment...</h2>
            <p className="text-gray-500 mt-2">{message}</p>
            <p className="text-xs text-gray-400 mt-4">ID: {tranId ? tranId.substring(0, 16) + '...' : 'N/A'}</p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="p-3 bg-green-100 rounded-full mb-4 shadow-md">
                <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">Payment Successful!</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <button 
              onClick={() => handleNavigation('/dashboard')}
              className="mt-6 w-full bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* FAILED / MANUAL CHECK STATE */}
        {(status === 'failed' || status === 'manual_check') && (
          <div className="flex flex-col items-center">
             <div className="p-3 bg-orange-100 rounded-full mb-4 shadow-md">
                <XCircle className="w-12 h-12 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Payment Status Alert</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <button 
              onClick={() => handleNavigation('/')}
              className="mt-6 w-full bg-gray-800 text-white px-6 py-3 rounded-xl hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Return Home
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

// Main Next.js Page component using Suspense
const PaymentSuccessPage = () => {
  // Required wrapper for client components using `useSearchParams` in the App Router
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xl text-gray-700">Initializing payment check...</div>}>
      <SuccessContent />
    </Suspense>
  );
};

export default PaymentSuccessPage;