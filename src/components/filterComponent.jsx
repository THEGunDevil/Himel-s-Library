"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FilterComponent({
  options,
  selectedStatus,
  setSelectedStatus,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    setSelectedStatus(option === selectedStatus ? "" : option);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors duration-200"
      >
        <span className="text-sm font-medium">
          {selectedStatus || "Filter by Status"}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              <button
                onClick={() => handleSelect("")}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  !selectedStatus ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                }`}
              >
                All Statuses
              </button>
              {options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                    selectedStatus === option
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-700"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}