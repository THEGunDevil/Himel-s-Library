import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

export default function SearchedPreview({ value = "", genre, setLocal, setOpen }) {
  const [page, setPage] = useState(1);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [debouncedValue, setDebouncedValue] = useState("");

  // Debounce input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        query: debouncedValue || "",
        page,
        limit: 10,
        genre: genre && genre !== "all" ? genre : "all",
      };

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/books/search`,
        { params }
      );

      setFilteredBooks(res.data.books || []);
      setTotalPages(Math.ceil(res.data.total_count / params.limit) || 1);
    } catch (err) {
      console.error("Error fetching books:", err);
      setFilteredBooks([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [debouncedValue, genre, page]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleNext = () => page < totalPages && setPage((prev) => prev + 1);
  const handlePrev = () => page > 1 && setPage((prev) => prev - 1);

  return (
    <div className="absolute mt-2 w-full bg-white shadow-lg max-h-80 overflow-hidden z-50 rounded">
      {/* Scrollable list */}
      <div className="overflow-y-auto max-h-64 pb-16">
        {loading ? (
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            Searching...
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="px-4 py-3 text-sm text-gray-500 text-center">
            No results found.
          </div>
        ) : (
          <ul className="relative">
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
                  className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={book.image_url}
                      alt={book.title}
                      className="w-12 h-16 object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{book.title}</div>
                      <div className="text-sm text-gray-500">by {book.author}</div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Sticky Pagination */}
      <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 px-3 py-2 flex items-center justify-center gap-3 text-sm">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-2 py-1 bg-blue-500 text-white disabled:opacity-50 rounded hover:bg-blue-600 transition-colors"
        >
          <ArrowLeftIcon className="h-3 w-3 inline-block mr-1" /> Prev
        </button>

        <span className="text-gray-700">
          {page} / {totalPages}
        </span>

        <button
          onClick={handleNext}
          disabled={page === totalPages}
          className="px-2 py-1 bg-blue-500 text-white disabled:opacity-50 rounded hover:bg-blue-600 transition-colors"
        >
          Next <ArrowRightIcon className="h-3 w-3 inline-block ml-1" />
        </button>
      </div>
    </div>
  );
}
