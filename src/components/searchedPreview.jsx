"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import axios from "axios";

export default function SearchedPreview({
  value = "",
  genre,
  setLocal,
  setOpen,
}) {
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBooks = useCallback(async () => {
    if (typeof value !== "string") {
      setFilteredBooks([]); // or handle differently
      return;
    }
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      setFilteredBooks([]);
      return;
    }

    try {
      setLoading(true);
      const params = { query: trimmedValue };
      if (genre && genre !== "all") params.genre = genre;

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/books/search`,
        { params }
      );
      setFilteredBooks(res.data || []);
    } catch (err) {
      console.error("Error fetching books:", err);
      setFilteredBooks([]);
    } finally {
      setLoading(false);
    }
  }, [value, genre]);

  useEffect(() => {
    const timer = setTimeout(fetchBooks, 300);
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  // Close preview if no input
  if (typeof value !== "string" || !value.trim()) return null;

  return (
    <div
      className="absolute top-full left-0 w-full mt-2 bg-blue-200 shadow-lg max-h-80 min-h-80 overflow-y-scroll z-50"
      role="listbox"
      aria-live="polite"
    >
      {loading ? (
        <div className="px-4 py-3 text-sm text-gray-500 text-center">
          Searching...
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="px-4 py-3 text-sm text-gray-500 text-center">
          No results found.
        </div>
      ) : (
        <ul>
          {filteredBooks.map((book) => (
            <li
              key={book.id}
              role="option"
              onClick={() => {
                setLocal([]);
                setOpen(false);
              }}
            >
              <Link
                href={`/book/${book.id}`}
                className="block px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={book.image_url}
                    alt={book.title}
                    className="w-12 h-16 object-cover"
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {book.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      by {book.author}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
