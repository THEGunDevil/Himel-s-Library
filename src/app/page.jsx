"use client";
import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import BookCard from "@/components/bookCard";
import BannerSlider from "@/components/bannerSlider";
import BookSliderByGenre from "@/components/bookSliderByGenre";
import { useBookData } from "@/hooks/useBookData";

// --- 1. Create a "Skeleton" Component ---
// This mimics the shape of your content while it loads
const SectionSkeleton = ({ height = "h-64" }) => (
  <div className={`w-full ${height} bg-gray-200 animate-pulse rounded-lg flex items-center justify-center`}>
    <span className="text-gray-400 text-sm">Loading...</span>
  </div>
);

const CardGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6 mt-5">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="h-80 bg-gray-200 animate-pulse rounded-lg"></div>
    ))}
  </div>
);

export default function Home() {
  const [page, setPage] = useState(1);

  // Initialize with empty arrays
  const { data: books = [], loading: booksLoading, totalPages } = useBookData({ page });
  const { data: classicRomanceBooks = [], loading: classicRomanceLoading } = useBookData({ genre: "Classic Romance" });
  const { data: classicBooks = [], loading: classicLoading } = useBookData({ genre: "Classic" });

  const scrollToGrid = () => {
    document.getElementById("books-grid")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNext = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
      scrollToGrid();
    }
  };

  const handlePrev = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
      scrollToGrid();
    }
  };

  return (
    <main className="md:pt-32 pt-24 xl:px-20 lg:px-20 px-4 min-h-screen pb-10">
      
      {/* 1. FEATURED SECTION */}
      <section className="min-h-80 mb-8"> 
        <h1 className="uppercase font-bold text-2xl text-blue-400 my-3">Featured Books</h1>
        {booksLoading ? <SectionSkeleton height="h-80" /> : <BannerSlider bannerBooks={books} />}
      </section>

      {/* 2. CLASSIC SECTION */}
      <section className="mb-8 min-h-[250px]">
        <div className="flex justify-between items-center text-blue-400 mb-4">
          <h1 className="uppercase font-bold text-2xl text-blue-400">Classic</h1>
          {!classicLoading && classicBooks.length > 5 && <ArrowRightIcon size={25} />}
        </div>
        {classicLoading ? <SectionSkeleton height="h-60" /> : <BookSliderByGenre books={classicBooks} />}
      </section>

      {/* 3. CLASSIC ROMANCE SECTION */}
      <section className="mb-8 min-h-[250px]">
        <div className="flex justify-between items-center text-blue-400 mb-4">
          <h1 className="uppercase font-bold text-2xl text-blue-400">Classic Romance</h1>
          {!classicRomanceLoading && classicRomanceBooks.length > 5 && <ArrowRightIcon size={25} />}
        </div>
        {classicRomanceLoading ? <SectionSkeleton height="h-60" /> : <BookSliderByGenre books={classicRomanceBooks} />}
      </section>

      {/* 4. ALL BOOKS GRID */}
      <section id="books-grid">
        <h1 className="uppercase font-bold text-2xl text-blue-400">All Books</h1>
        
        {booksLoading ? (
          <CardGridSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6 mt-5 place-items-center">
              {Array.isArray(books) && books.map((book) => (
                 <BookCard key={book.id} book={book} />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center my-8 gap-4">
              <button
                onClick={handlePrev}
                disabled={page === 1}
                className="px-4 py-2 flex items-center bg-blue-400 text-white rounded disabled:opacity-50 hover:bg-blue-500 transition"
              >
                <ArrowLeftIcon className="h-4 mr-2" /> Previous
              </button>
              <span className="text-gray-700">Page {page} of {totalPages}</span>
              <button
                onClick={handleNext}
                disabled={page === totalPages}
                className="px-4 py-2 flex items-center bg-blue-400 text-white rounded disabled:opacity-50 hover:bg-blue-500 transition"
              >
                Next <ArrowRightIcon className="h-4 ml-2" />
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}