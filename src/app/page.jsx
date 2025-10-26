"use client";
import BookCard from "@/components/bookCard";
import BookSlider from "@/components/bookSlider";
import Loader from "@/components/loader";
import { useBookData } from "@/hooks/useBookData";
export default function Home() {
  // optional chaining prevents errors
  const { data: books, loading, error } = useBookData();

  if (error) {
    console.error(error);
    return <p className="text-red-500">Failed to load books.</p>;
  }
  return (
    <main className="md:pt-32 pt-24 xl:px-60 lg:px-30 px-4">
      <BookSlider bannerBooks={books}/>
      {loading ? (
        <Loader />
      ) : (
        <div className="py-10">
          <h1 className="uppercase font-bold text-2xl text-blue-400">
            featured books
          </h1>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mt-5 place-items-center">
            {books?.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
