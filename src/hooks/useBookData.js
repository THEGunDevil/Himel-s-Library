"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export function useBookData({ page = 1, limit = 10, genre = "" } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let url;

      if (genre) {
        // Fetch books by genre
        url = `${process.env.NEXT_PUBLIC_API_URL}/books/genre/${genre}`;
      } else {
        // Fetch paginated books
        const params = new URLSearchParams({ page, limit });
        url = `${process.env.NEXT_PUBLIC_API_URL}/books/?${params.toString()}`;
      }

      const response = await axios.get(url);

      // Support both paginated and non-paginated responses
      setData(response.data?.books ?? response.data ?? []);
      setTotalPages(response.data?.total_pages ?? 1);
    } catch (err) {
      console.error("❌ Failed to fetch books:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, genre]);

  // Automatically fetch on mount and when deps change
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return { data, loading, error, totalPages, refetch: fetchBooks };
}
