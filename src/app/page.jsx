"use client";
import { useState } from "react";
import BookCard from "@/components/bookCard";
import BannerSlider from "@/components/bannerSlider";
import Loader from "@/components/loader";
import { useBookData } from "@/hooks/useBookData";
import BookSliderByGenre from "@/components/bookSliderByGenre";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

export default function Home() {
  const [page, setPage] = useState(1);
  // Hooks
  const { data: books, loading, error, totalPages } = useBookData({ page });
  const {
    data: classicRomanceBooks,
    loading: classicRomanceLoading,
    error: classicRomanceError,
  } = useBookData({ genre: "Classic Romance" });

  const {
    data: classicBooks,
    loading: classicLoading,
    error: classicError,
  } = useBookData({ genre: "Classic" });

  // Combine all loading and error states
  const isLoading = loading || classicRomanceLoading || classicLoading;
  const hasError = error || classicRomanceError || classicError;

  // Error handling
  if (hasError) {
    console.error(hasError);
    return (
      <p className="text-red-500 text-center mt-10">Failed to load books.</p>
    );
  }

  // Single global loader
  if (isLoading) {
    return (
      <main className="md:pt-32 pt-24 xl:px-60 lg:px-30 px-4 flex justify-center items-center min-h-screen">
        <Loader />
      </main>
    );
  }

  // Pagination controls
  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  return (
    <main className="md:pt-32 pt-24 xl:px-20 lg:px-20 px-4 min-h-screen">
      <h1 className="uppercase font-bold text-2xl text-blue-400 my-5">
        Featured Books
      </h1>
      <BannerSlider bannerBooks={books} />

      {/* Classic */}
      <div className="mt-5">
        <div className="flex justify-between items-center text-blue-400">
          <h1 className="uppercase font-bold text-2xl text-blue-400">
            Classic
          </h1>
          {classicBooks && <ArrowRightIcon size={30} />}
        </div>
        <BookSliderByGenre books={classicBooks} />
      </div>

      {/* Classic Romance */}
      <div className="mt-10">
        <div className="flex justify-between items-center text-blue-400">
          <h1 className="uppercase font-bold text-2xl text-blue-400">
            Classic Romance
          </h1>
          {classicRomanceBooks && <ArrowRightIcon size={30} />}
        </div>
        <BookSliderByGenre books={classicRomanceBooks} />
      </div>

      {/* Featured Books with Pagination */}
      <div className="mt-5">
        <h1 className="uppercase font-bold text-2xl text-blue-400">
          All Books
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mt-5 place-items-center">
          {Array.isArray(books) &&
            books.map((book) => <BookCard key={book.id} book={book} />)}
        </div>

        {/* Pagination Buttons */}
        <div className="flex justify-center items-center my-5 gap-4">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="px-4 py-2 flex items-center cursor-pointer bg-blue-400 text-white disabled:opacity-50"
          >
            <ArrowLeftIcon className="h-4" />
            Previous
          </button>
          <span className="text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className="px-4 py-2 flex items-center cursor-pointer bg-blue-400 text-white disabled:opacity-50"
          >
            Next <ArrowRightIcon className="h-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
