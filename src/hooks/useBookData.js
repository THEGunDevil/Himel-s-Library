"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export function useBookData({
  page = 1,
  limit = 10,
  genre = "Adventure",
} = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [genres, setGenres] = useState([]);
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit });
      let url = `${process.env.NEXT_PUBLIC_API_URL}/books`;
      if (genre) {
        url += `/genre/${encodeURIComponent(genre)}`;
      }
      url += `?${params.toString()}`;
      const response = await axios.get(url);
      setData(response.data?.books ?? response.data ?? []);
      setTotalPages(response.data?.total_pages ?? 1);
    } catch (err) {
      console.error("❌ Error Message:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, genre]);

  const fetchGenres = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/books/genres`
      );
      if (Array.isArray(res.data)) {
        setGenres(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch genres:", err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchGenres();
  }, []);

  return {
    data,
    loading,
    error,
    totalPages,
    genres,
    refetch: fetchData,
    refetchGenres: fetchGenres,
  };
}
