import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/authContext";

export function useBorrowData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [borrowsByUser, setBorrowsByUser] = useState([]);
  const [borrowsByUserLoading, setBorrowsByUserLoading] = useState(false);
  const [borrowsByUserError, setBorrowsByUserError] = useState(null);

  const { token, isAdmin } = useAuth();

  useEffect(() => {
    if (!token && !isAdmin) return; // ✅ wait for token before fetching

    const fetchBorrows = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/borrows/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Fetched borrows:", response.data);
        setData(response.data);
      } catch (err) {
        console.error("❌ Failed to fetch borrows:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBorrows();
  }, [token]);

  const fetchBorrowsByUserID = async (id) => {
    setBorrowsByUserLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/borrows/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Fetched borrows:", response.data);
      setBorrowsByUser(response.data);
    } catch (err) {
      console.error("❌ Failed to fetch borrows:", err);
      setBorrowsByUserError(err);
    } finally {
      setBorrowsByUserLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    borrowsByUser,
    borrowsByUserError,
    borrowsByUserLoading,
    fetchBorrowsByUserID,
  };
}
