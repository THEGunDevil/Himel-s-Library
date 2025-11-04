"use client";

import { DownloadIcon } from "lucide-react";
import { useState } from "react";
import axios from "axios";

export default function DownloadOptions({
  token,
  endpoint, // e.g., "/download/books", "/download/users", "/download/borrows"
  page = 1, // current page
  limit = 10, // current limit per page
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  const handleDropDownOpen = () => setOpen((prev) => !prev);

  // Generic download function
  const handleDownload = async (format) => {
    try {
      const response = await axios.get(endpoint, {
        params: { format, page, limit },
        responseType: "blob",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      // Extract filename from headers or fallback
      const contentDisposition = response.headers["content-disposition"];
      let fileName = `${endpoint.split("/").pop()}_${format}.` + format;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match) fileName = match[1];
      }

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={handleDropDownOpen}
        className="p-1.5 cursor-pointer bg-white flex justify-center items-center rounded border border-gray-300"
      >
        <DownloadIcon className="h-5 text-blue-600" />
      </button>

      {open && (
        <div className="absolute right-0 top-0 w-32 bg-white border border-gray-400 z-50 shadow-lg">
          <button
            onClick={() => {
              handleDownload("pdf");
              setOpen(false);
            }}
            className="block w-full cursor-pointer text-left px-4 py-2 text-sm hover:bg-gray-50 hover:rounded-t-lg disabled:opacity-50"
            disabled={disabled}
          >
            Download <span className="text-blue-500 font-medium">PDF</span>
          </button>
          <button
            onClick={() => {
              handleDownload("csv");
              setOpen(false);
            }}
            className="block w-full text-left px-4 cursor-pointer py-2 text-sm hover:bg-gray-50 hover:rounded-b-lg disabled:opacity-50"
            disabled={disabled}
          >
            Download <span className="text-blue-500 font-medium">CSV</span>
          </button>
          <button
            onClick={() => {
              handleDownload("xlsx");
              setOpen(false);
            }}
            className="block w-full text-left px-4 cursor-pointer py-2 text-sm hover:bg-gray-50 hover:rounded-b-lg disabled:opacity-50"
            disabled={disabled}
          >
            Download <span className="text-blue-500 font-medium uppercase">xlsx</span>
          </button>
        </div>
      )}
    </div>
  );
}
