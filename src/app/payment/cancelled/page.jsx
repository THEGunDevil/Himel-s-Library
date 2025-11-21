'use client';

import React from 'react';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CancelledContent = () => {
const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
        
        <div className="flex flex-col items-center">
          <div className="bg-red-100 p-4 rounded-full mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h2>
          
          <p className="text-gray-600 mb-8">
            You have not been charged. The transaction was cancelled before it could be processed.
          </p>

          <div className="space-y-3 w-full">
            <button 
              onClick={() => router.push('/')}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Return to Home
            </button>

            {/* <button 
              onClick={() => handleNavigation('/pricing')}
              className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Plans Again
            </button> */}
          </div>

          <div className="mt-8 flex items-center justify-center text-sm text-gray-500">
            <HelpCircle className="w-4 h-4 mr-1" />
            <span>Having trouble? <a href="#" className="text-blue-600 hover:underline">Contact Support</a></span>
          </div>
        </div>

      </div>
    </div>
  );
};

// Wrapper for preview compatibility
const PaymentCancelledPage = () => {
  return (
    <BrowserRouter>
      <CancelledContent />
    </BrowserRouter>
  );
};

export default PaymentCancelledPage;