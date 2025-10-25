"use client";
import BookCard from "@/components/bookCard";
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
    <main className="md:pt-28 pt-20 xl:px-60 lg:px-20 px-4">
      <img
        src="ChatGPT Image Oct 12, 2025, 12_23_53 AM.webp"
        alt="Book discount Ad"
        className="w-full h-100 object-cover"
      />
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
