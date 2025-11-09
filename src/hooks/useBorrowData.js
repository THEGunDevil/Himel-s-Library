import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/authContext";

export function useBorrowData() {
  // ---------- global borrows ----------
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  // ---------- borrows by user ----------
  const [borrowsByUser, setBorrowsByUser] = useState([]);
  const [borrowsByUserLoading, setBorrowsByUserLoading] = useState(false);
  const [borrowsByUserError, setBorrowsByUserError] = useState(null);

  const { accessToken, isAdmin } = useAuth();

  const fetchAllBorrows = useCallback(async () => {
    if (!accessToken || !isAdmin) return;

    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/borrows/`,
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
  }, [accessToken,isAdmin]);

  useEffect(() => {
    if (accessToken) fetchAllBorrows();
  }, [accessToken, fetchAllBorrows]);

  const fetchBorrowsByUserID = async (userId) => {
    if (!accessToken) return;

    setBorrowsByUserLoading(true);
    setBorrowsByUserError(null);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/borrows/${userId}`,
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

  const refetch = () => fetchAllBorrows();
  console.log(data);

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
  };
}
