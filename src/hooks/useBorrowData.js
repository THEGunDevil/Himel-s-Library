import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/authContext";

export function useBorrowData() {
  // ---------- global borrows ----------
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---------- borrows by user ----------
  const [borrowsByUser, setBorrowsByUser] = useState([]);
  const [borrowsByUserLoading, setBorrowsByUserLoading] = useState(false);
  const [borrowsByUserError, setBorrowsByUserError] = useState(null);

  const { token, isAdmin } = useAuth();

  const fetchAllBorrows = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/borrows/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(res.data || []);
    } catch (err) {
      console.error("Failed to fetch borrows:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchAllBorrows();
  }, [token, fetchAllBorrows]);

  const fetchBorrowsByUserID = async (userId) => {
    if (!token) return;

    setBorrowsByUserLoading(true);
    setBorrowsByUserError(null);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/borrows/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
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


  return {
    data,
    loading,
    error,
    refetch,            

    borrowsByUser,
    borrowsByUserLoading,
    borrowsByUserError,
    fetchBorrowsByUserID,
  };
}