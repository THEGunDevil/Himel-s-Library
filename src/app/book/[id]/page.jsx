"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/authContext";
import { useParams } from "next/navigation";
import { useSingleBookData } from "@/hooks/useSingleBookData";
import BookReviewSection from "@/components/bookReview";
import { getDueDate } from "../../../../utlis/utils";

export default function Book() {
  const { accessToken } = useAuth();
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const {
    data: bookData,
    loading: bookLoading,
    error: bookError,
  } = useSingleBookData(id);

  useEffect(() => {
    if (bookData) setBook(bookData);
  }, [bookData]);

  const [borrowed, setBorrowed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dueDate, setDueDate] = useState("");

  const handleBorrow = async () => {
    if (!accessToken) {
      setError("You must be logged in to borrow a book.");
      return;
    }

    if (!book?.id || !dueDate) return;

    setLoading(true);
    setError(null);

    try {
      const formattedDueDate = new Date(dueDate).toISOString();
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/borrows/borrow`,
        { book_id: book.id, due_date: formattedDueDate },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setBorrowed(true);
      setBook((prev) => ({
        ...prev,
        available_copies: Math.max(prev.available_copies - 1, 0),
      }));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to borrow the book.");
    } finally {
      setLoading(false);
    }
  };

  if (bookLoading || !book) return <div className="p-6">Loading book...</div>;
  if (bookError)
    return <div className="p-6 text-red-500">Failed to load book.</div>;

  return (
    <section className="flex flex-col w-full lg:flex-row md:pt-36 pt-32 justify-between gap-5 items-start xl:px-60 lg:px-30 px-4 mb-10">
      {/* Book Info */}
      <div
        className="bg-white w-full lg:w-1/2 shadow-lg p-6 flex flex-col items-center hover:shadow-xl transition-shadow duration-300 
                      h-auto lg:h-[700px] xl:h-[720px]"
      >
        <div className="relative w-full flex justify-center items-center h-60 bg-gray-50 rounded-lg overflow-hidden">
          {book.image_url ? (
            <img
              src={book.image_url || "/placeholder-book.jpg"}
              alt={book.title}
              className="h-full object-contain transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
              No Cover
            </div>
          )}
          {borrowed && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Borrowed
            </span>
          )}
        </div>

        <h2 className="mt-4 font-bold text-lg text-center line-clamp-2">
          {book.title}
        </h2>
        <p className="text-gray-600 text-sm text-center line-clamp-1">
          {book.author}
        </p>

        {book.description && (
          <p className="mt-2 text-gray-500 text-sm text-center line-clamp-3">
            {book.description}
          </p>
        )}
        <p className="text-gray-500 text-sm text-center line-clamp-1">
          Genre:{" "}
          {Array.isArray(book.genre) ? book.genre.join(", ") : book.genre}
        </p>

        <div className="mt-3 flex justify-between items-center w-full">
          <div>
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                book.available_copies > 0
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              }`}
            >
              {book.available_copies > 0 ? "Available" : "Unavailable"}
            </span>
            {book.available_copies > 0 && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                {book.available_copies}{" "}
                {book.available_copies > 1 ? "copies" : "copy"}
              </span>
            )}
          </div>
        </div>

        {!borrowed && book.available_copies > 0 && (
          <div className="mt-4 w-full flex flex-col items-center">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Select due date
            </label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            >
              <option value="">-- Choose duration --</option>
              <option value={getDueDate(7)}>1 week</option>
              <option value={getDueDate(14)}>2 weeks</option>
              <option value={getDueDate(21)}>3 weeks</option>
            </select>
          </div>
        )}

        {!borrowed && book.available_copies > 0 && (
          <button
            onClick={handleBorrow}
            disabled={loading || !dueDate}
            className={`mt-4 px-4 py-2 w-1/2 rounded-lg text-white text-sm transition ${
              loading || !dueDate
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Borrowing..." : "Borrow"}
          </button>
        )}

        {error && (
          <p className="mt-2 text-red-500 text-sm text-center">{error}</p>
        )}
      </div>

      {/* Book Review Section (same height) */}
      <div className="w-full lg:w-1/2 h-auto lg:h-[700px] xl:h-[720px]">
        <BookReviewSection bookId={book.id} />
      </div>
    </section>
  );
}
