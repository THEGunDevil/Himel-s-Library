"use client";


import { ToastContainer } from "react-toastify";
import { CheckCircle, XCircle } from "lucide-react";

export default function ToastProvider() {
  return (
    <ToastContainer
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss={false}
      pauseOnHover={false}
      icon={({ type }) => {
        switch (type) {
          case "success":
            return <CheckCircle className="w-5 h-5 text-blue-400" />;
          case "error":
            return <XCircle className="w-5 h-5 text-red-600" />;
          //   case 'warning':
          //     return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
          //   case 'info':
          //     return <Info className="w-5 h-5 text-blue-600" />;
          default:
            return false;
        }
      }}
      className="custom-toast"
      progressClassName="custom-progress"
    />
  );
}
