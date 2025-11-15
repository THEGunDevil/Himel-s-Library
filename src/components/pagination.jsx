"use client";

import React from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

export default function Pagination({ page, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null;

  return (
    <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 px-3 py-2 flex items-center justify-center gap-3 text-sm">
      <button
        onClick={onPrev}
        disabled={page === 1}
        className="px-2 py-1 bg-blue-500 text-white disabled:opacity-50 rounded hover:bg-blue-600 transition-colors"
      >
        <ArrowLeftIcon className="h-3 w-3 inline-block mr-1" /> Prev
      </button>

      <span className="text-gray-700">
        {page} / {totalPages}
      </span>

      <button
        onClick={onNext}
        disabled={page === totalPages}
        className="px-2 py-1 bg-blue-500 text-white disabled:opacity-50 rounded hover:bg-blue-600 transition-colors"
      >
        Next <ArrowRightIcon className="h-3 w-3 inline-block ml-1" />
      </button>
    </div>
  );
}
