"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/authContext";

export function useBorrowData({ page = 1, limit = 10, bookID } = {}) {
  // ---------- global borrows ----------
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  // ---------- borrows by user ----------
  const [borrowsByUser, setBorrowsByUser] = useState([]);
  const [borrowsByUserLoading, setBorrowsByUserLoading] = useState(false);
  const [borrowsByUserError, setBorrowsByUserError] = useState(null);
  // ---------- borrows by book ----------
  const [borrowsByBook, setBorrowsByBook] = useState([]);
  const [borrowsByBookLoading, setBorrowsByBookLoading] = useState(false);
  const [borrowsByBookError, setBorrowsByBookError] = useState(null);
  // ---------- borrows by book and user ----------
  const [borrow, setBorrow] = useState([]);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [borrowError, setBorrowError] = useState(null);

  const { accessToken, isAdmin } = useAuth();

  const fetchAllBorrows = useCallback(async () => {
    if (!accessToken || !isAdmin) return;

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit });
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/borrows/?${params}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setData(res.data || []);
      setTotalPages(res.data?.total_pages ?? 1);
    } catch (err) {
      console.error("Failed to fetch borrows:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAdmin]);

  useEffect(() => {
    if (accessToken) fetchAllBorrows();
  }, [accessToken, fetchAllBorrows]);

  const fetchBorrowsByUserID = async (userID) => {
    if (!accessToken) return;

    setBorrowsByUserLoading(true);
    setBorrowsByUserError(null);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/borrows/user/${userID}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setBorrowsByUser(res.data || []);
    } catch (err) {
      console.error("Failed to fetch borrows for user:", err);
      setBorrowsByUserError(err);
    } finally {
      setBorrowsByUserLoading(false);
    }
  };
  const fetchBorrowsByBookID = useCallback(
    async (id = bookID) => {
      if (!id || !accessToken) return;

      setBorrowsByBookLoading(true);
      setBorrowsByBookError(null);

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/borrows/book/${bookID}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        setBorrowsByBook(response.data || []);
        return response.data;
      } catch (error) {
        setBorrowsByBookError(
          error.response?.data?.message || "Failed to fetch borrows"
        );
      } finally {
        setBorrowsByBookLoading(false);
      }
    },
    [accessToken, bookID, page, limit]
  );
const fetchBorrowsByBookIDAndUserID = useCallback(
  async () => {
    if (!bookID || !accessToken) return [];

    setBorrowLoading(true);
    setBorrowError(null);

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/borrows/borrow/book/${bookID}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setBorrow(response.data || []);
      return response.data || [];
    } catch (err) {
      if (err.response?.status === 404) {
        setBorrow([]);
        return [];
      }
      // Other errors
      setBorrowError(err.response?.data?.error || "Failed to fetch borrows");
      console.error(err.response?.data?.error || err.message);
      return [];
    } finally {
      setBorrowLoading(false);
    }
  },
  [accessToken, bookID]
);



  const refetch = () => fetchAllBorrows();
  return {
    data,
    loading,
    error,
    totalPages,
    refetch,

    borrowsByUser,
    borrowsByUserLoading,
    borrowsByUserError,
    fetchBorrowsByUserID,

    borrowsByBook,
    borrowsByBookLoading,
    borrowsByBookError,
    fetchBorrowsByBookID,

    borrow,
    setBorrow,
    borrowLoading,
    borrowError,
    fetchBorrowsByBookIDAndUserID,
  };
}
