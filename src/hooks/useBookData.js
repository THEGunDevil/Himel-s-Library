import { useState, useEffect } from "react";
import axios from "axios";

export function useBookData({ page = 1, limit = 10, genre = "" } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        let url;

        if (genre) {
          // Fetch books by genre
          url = `${process.env.NEXT_PUBLIC_API_URL}/books/genre/${genre}`;
        } else {
          // Fetch paginated books
          const params = new URLSearchParams({ page, limit });
          url = `${
            process.env.NEXT_PUBLIC_API_URL
          }/books/?${params.toString()}`;
        }

        const response = await axios.get(url);        
        setData(response.data?.books ?? response.data ?? []);
        setTotalPages(response.data?.total_pages);
        
        // setTotalPages(response.data);
      } catch (err) {
        console.error("❌ Failed to fetch books:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [page, limit, genre]);

  return { data, loading, error, totalPages };
}
