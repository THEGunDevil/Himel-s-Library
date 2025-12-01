"use client";
import { useEffect, useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import BookCard from "@/components/bookCard";
import BannerSlider from "@/components/bannerSlider";
import BookSliderByGenre from "@/components/bookSliderByGenre";
import { useBookData } from "@/hooks/useBookData";
import Pagination from "@/components/pagination";
import { Badge } from "@/components/ui/badge";

const SectionSkeleton = ({ height = "h-64" }) => (
  <div
    className={`w-full ${height} bg-gray-200 dark:bg-slate-800 animate-pulse rounded-lg flex items-center justify-center`}
  >
    <span className="text-gray-400 dark:text-slate-300 text-sm">
      Loading...
    </span>
  </div>
);

const CardGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6 mt-5">
    {[...Array(10)].map((_, i) => (
      <div
        key={i}
        className="h-80 bg-gray-200 animate-pulse dark:bg-slate-800 rounded-lg"
      ></div>
    ))}
  </div>
);

export default function Home() {
  const [page, setPage] = useState(1);
  const [genre, setGenre] = useState("Adventure");
  const { data: books = [], loading: booksLoading } = useBookData({ page: 1 });
  const {
    data: booksFiltered = [],
    loading: booksFilteredLoading,
    totalPages: booksFilteredTotalPages,
    genres,
  } = useBookData({ page, genre: genre || "Adventure" });
  const { data: classicRomanceBooks = [], loading: classicRomanceLoading } =
    useBookData({ genre: "Classic Romance" });
  const { data: classicBooks = [], loading: classicLoading } = useBookData({
    genre: "Classic",
  });

  const scrollToGrid = () => {
    document
      .getElementById("books-grid")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNext = () => {
    if (page < booksFilteredTotalPages) {
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
      <section className="min-h-80 mb-5 sm:mb-8">
        <h1 className="uppercase font-bold text-2xl dark:text-gray-200 text-blue-400 mb-3">
          Featured Books
        </h1>
        {booksLoading ? (
          <SectionSkeleton height="h-80" />
        ) : (
          <BannerSlider bannerBooks={books} />
        )}
      </section>

      <section className="mb-5 sm:mb-8 min-h-[250px]">
        <div className="flex justify-between items-center text-blue-400 mb-4">
          <h1 className="uppercase font-bold text-2xl text-blue-400 dark:text-gray-200">
            Classic
          </h1>
          {!classicLoading && classicBooks.length > 5 && (
            <ArrowRightIcon size={25} />
          )}
        </div>
        {classicLoading ? (
          <SectionSkeleton height="h-60" />
        ) : (
          <BookSliderByGenre books={classicBooks} />
        )}
      </section>

      <section className="mb-5 sm:mb-8 min-h-[250px]">
        <div className="flex justify-between items-center text-blue-400 mb-4">
          <h1 className="uppercase font-bold text-2xl text-blue-400 dark:text-gray-200">
            Classic Romance
          </h1>
          {!classicRomanceLoading && classicRomanceBooks.length > 5 && (
            <ArrowRightIcon size={25} />
          )}
        </div>
        {classicRomanceLoading ? (
          <SectionSkeleton height="h-60" />
        ) : (
          <BookSliderByGenre books={classicRomanceBooks} />
        )}
      </section>

      <section className="flex flex-wrap flex-col gap-2 mb-5">
        <h1 className="uppercase font-bold text-2xl text-blue-400 dark:text-gray-200">
          Genres
        </h1>
        <div className="flex flex-wrap gap-2 mb-5">
          {genres?.map((g) => (
            <Badge
              key={g}
              onClick={() => setGenre(g)}
              variant="ghost"
              className={`p-2 shadow-blue-200 text-gray-700 dark:text-slate-300 dark:hover:text-slate-50 font-semibold shadow-inner cursor-pointer hover:scale-105 transition-all duration-150 ${
                genre === g
                  ? "outline-2 outline-blue-500 dark:outline-blue-100"
                  : ""
              }`}
              style={{
                boxShadow: "inset 2px 2px 6px 2px rgba(59, 130, 246, 0.2)",
              }}
            >
              {g}
            </Badge>
          ))}
        </div>
      </section>

      <section id="books-grid">
        {booksFilteredLoading ? (
          <CardGridSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 md:gap-6 mt-5 place-items-center">
              {Array.isArray(booksFiltered) &&
                booksFiltered.map((bf) => <BookCard key={bf.id} book={bf} />)}
            </div>
            <div className="flex relative flex-col sm:flex-row justify-between items-center py-5 gap-4 mt-5">
              <Pagination
                type="homepage"
                page={page}
                totalPages={booksFilteredTotalPages}
                onPrev={handlePrev}
                onNext={handleNext}
              />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
