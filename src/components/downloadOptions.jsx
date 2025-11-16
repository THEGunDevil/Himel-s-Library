"use client";

import { DownloadIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function DownloadOptions({ token, endpoint, page = 1, limit = 10, disabled = false, filters = {} }) {
  const [open, setOpen] = useState(false);
  const [loadingFormat, setLoadingFormat] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropDownOpen = () => setOpen((prev) => !prev);

  const handleDownload = async (format) => {
    try {
      setLoadingFormat(format);
      const response = await axios.get(endpoint, {
        params: {
          format,
          page,
          limit,
          ...filters, // merge filters like status, query, searchOption
        },
        responseType: "blob",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      // Extract filename from response headers
      const contentDisposition = response.headers["content-disposition"];
      let fileName = `${endpoint.split("/").pop()?.replace(/\W+/g, "_")}_${format}.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match) fileName = match[1];
      }

      // Trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Check console for details.");
    } finally {
      setLoadingFormat(null);
      setOpen(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={handleDropDownOpen}
        className="p-1.5 cursor-pointer bg-white flex justify-center items-center rounded border border-gray-300"
      >
        <DownloadIcon className="h-5 text-blue-600" />
      </button>

      {open && (
        <div className="absolute right-0 top-0 bg-white border border-gray-400 z-50 w-40 shadow-lg">
          <button
            onClick={() => handleDownload("csv")}
            disabled={disabled || loadingFormat !== null}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 hover:rounded-b-lg disabled:opacity-50"
          >
            {loadingFormat === "csv" ? "Downloading..." : "Download CSV"}
          </button>
          <button
            onClick={() => handleDownload("xlsx")}
            disabled={disabled || loadingFormat !== null}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 hover:rounded-b-lg disabled:opacity-50"
          >
            {loadingFormat === "xlsx" ? "Downloading..." : "Download XLSX"}
          </button>
        </div>
      )}
    </div>
  );
}
