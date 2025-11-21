'use client';

import React, { useEffect, useState, Suspense } from 'react';
// FOR NEXT.JS APP: Uncomment the line below and delete the react-router-dom import
// import { useSearchParams, useRouter } from 'next/navigation';
import { useSearchParams, useNavigate, BrowserRouter } from 'react-router-dom'; 
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Internal component logic
const SuccessContent = () => {
  // FOR NEXT.JS APP: Use these hooks instead
  // const searchParams = useSearchParams();
  // const router = useRouter();
  
  // FOR PREVIEW (React Router):
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get tran_id from URL query parameters
  const tranId = searchParams.get('tran_id');

  const [status, setStatus] = useState('loading'); // loading | success | failed | manual_check
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    if (!tranId) {
      setStatus('failed');
      setMessage('No transaction ID found.');
      return;
    }

    let intervalId;
    let attempts = 0;
    const maxAttempts = 10; // Stop after 20 seconds

    const checkStatus = async () => {
      try {
        attempts++;
        // Replace with your actual Backend URL
        const API_URL = `https://book-library-api-production-2db5.up.railway.app/stripe/callback?tran_id=${tranId}`;
        
        const response = await fetch(API_URL);
        const data = await response.json();

        if (response.ok && data.status === 'paid') {
          setStatus('success');
          setMessage('Payment confirmed! Your subscription is active.');
          clearInterval(intervalId);
        } else if (attempts >= maxAttempts) {
          setStatus('manual_check');
          setMessage('Payment is taking longer than usual. Please check your dashboard.');
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error("Error checking payment:", error);
      }
    };

    // Check immediately, then every 2 seconds
    checkStatus();
    intervalId = setInterval(checkStatus, 2000);

    return () => clearInterval(intervalId);
  }, [tranId]);

  // Helper for navigation (handles difference between Next.js and React Router)
  const handleNavigation = (path) => {
    // FOR NEXT.JS APP: router.push(path);
    navigate(path);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        
        {/* LOADING */}
        {status === 'loading' && (
          <div className="flex flex-col items-center animate-pulse">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Processing...</h2>
            <p className="text-gray-500 mt-2">Please wait while we confirm your payment.</p>
          </div>
        )}

        {/* SUCCESS */}
        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <button 
              onClick={() => handleNavigation('/dashboard')}
              className="mt-6 bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* FAILED */}
        {(status === 'failed' || status === 'manual_check') && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-orange-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Status Update</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <button 
              onClick={() => handleNavigation('/')}
              className="mt-6 bg-gray-800 text-white px-6 py-2 rounded-full hover:bg-gray-900 transition-colors"
            >
              Return Home
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

// Note: In the actual Next.js app, you might not need BrowserRouter 
// if this is a page inside the App Router, but you DO need Suspense.
const PaymentSuccessPage = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </BrowserRouter>
  );
};

export default PaymentSuccessPage;