"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function FilterComponent({
  options, // [{ label, value }]
  selectedStatus,
  setSelectedStatus,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (value) => {
    // toggle off if same value clicked
    setSelectedStatus(value === selectedStatus ? "" : value);
    setIsOpen(false);    
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside,true);
      return () => document.removeEventListener("mousedown", handleClickOutside,true);
    }
  }, [isOpen]);

  // Helper: find label by value for button display
  const getLabel = (value) => {
    if (!value) return "All Statuses";
    const found = options.find((opt) => opt.value === value);
    return found ? found.label : "Unknown";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-2 bg-white dark:bg-transparent border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-sm whitespace-nowrap font-medium">{getLabel(selectedStatus)}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 md:right-0 mt-2 w-48 dark:bg-slate-900 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          <div className="py-1 max-h-48 overflow-y-auto">
            {/* "All" option */}
            <button
              onClick={() => handleSelect("")}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                !selectedStatus
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700"
              }`}
            >
              All Statuses
            </button>

            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full whitespace-nowrap text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  selectedStatus === option.value
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 dark:text-gray-400"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
