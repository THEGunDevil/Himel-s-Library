"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

export default function BookCard({ book }) {
  const router = useRouter();

  const handleViewBook = (id) => {
    router.push(`/book/${id}`);
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        handleViewBook(book.id);
      }}
      className="w-full max-w-[320px] sm:max-w-[260px] md:max-w-[280px] lg:max-w-[300px] xl:max-w-[320px]
                 bg-blue-100 hover:shadow-lg shadow-md
                 overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
    >
      {/* Image Section */}
      <div className="relative bg-blue-50 flex justify-center items-center h-56 sm:h-52 md:h-60 lg:h-64">
        <Image
          src={book.image_url}
          alt={book.title}
          fill
          className="object-contain brightness-75"
          priority
        />

        {book.isBorrowed && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs sm:text-[10px] font-semibold px-2 py-1 rounded-full">
            Borrowed
          </span>
        )}
      </div>

      {/* Info Section */}
      <div className="p-3 sm:p-4">
        <h2 className="text-base sm:text-lg font-bold line-clamp-1">
          {book.title}
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
          {book.author}
        </p>

        <div className="flex justify-between items-center mt-3 sm:mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span
              className={`${
                book.available_copies > 0
                  ? "text-gray-800"
                  : "text-red-500 font-semibold"
              } text-sm`}
            >
              {book.available_copies === 0 ? "Not Available" : "Available"}
            </span>

            {book.available_copies > 0 && (
              <span className="text-xs bg-blue-200 text-gray-900 px-2 py-1 rounded-md">
                {book.available_copies}
              </span>
            )}
          </div>

          <button className="text-blue-600 hover:text-blue-800 text-sm sm:text-base font-medium flex items-center gap-1">
            📖 View
          </button>
        </div>
      </div>
    </div>
  );
}
