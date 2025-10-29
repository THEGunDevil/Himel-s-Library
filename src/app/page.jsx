"use client";
import { useState } from "react";
import BookCard from "@/components/bookCard";
import BannerSlider from "@/components/bannerSlider";
import Loader from "@/components/loader";
import { useBookData } from "@/hooks/useBookData";
import BookSliderByGenre from "@/components/bookSliderByGenre";

export default function Home() {
  // main books pagination
  const [page, setPage] = useState(1);
  const { data: books, loading, error, totalPages } = useBookData({ page });
  console.log(totalPages);
  
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

  if (error || classicRomanceError || classicError) {
    console.error(error || classicRomanceError || classicError);
    return <p className="text-red-500">Failed to load books.</p>;
  }

  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  return (
    <main className="md:pt-32 pt-24 xl:px-60 lg:px-30 px-4">
      <BannerSlider bannerBooks={books} />

      {/* Classic Romance */}
      <div className="py-10">
        <h1 className="uppercase font-bold text-2xl text-blue-400">Classic Romance</h1>
        {classicRomanceLoading ? <Loader /> : <BookSliderByGenre books={classicRomanceBooks} />}
      </div>

      {/* Classic */}
      <div className="py-10">
        <h1 className="uppercase font-bold text-2xl text-blue-400">Classic</h1>
        {classicLoading ? <Loader /> : <BookSliderByGenre books={classicBooks} />}
      </div>

      {/* Featured Books with Pagination */}
      <div className="py-10">
        <h1 className="uppercase font-bold text-2xl text-blue-400">Featured Books</h1>
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mt-5 place-items-center">
              {books?.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* Pagination Buttons */}
            <div className="flex justify-center items-center mt-8 gap-4">
              <button
                onClick={handlePrev}
                disabled={page === 1}
                className="px-4 py-2 bg-blue-400 text-white rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={page === totalPages}
                className="px-4 py-2 bg-blue-400 text-white rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
