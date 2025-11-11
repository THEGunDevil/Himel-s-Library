"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export function useSingleBookData(bookId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bookId) return;

    const fetchBook = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/books/${bookId}`
        );

        setData(response.data);
      } catch (err) {
        console.error("❌ Failed to fetch book:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  return { data, loading, error };
}
