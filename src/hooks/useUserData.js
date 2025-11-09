import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/authContext";

export function useUserData({ page = 1, limit = 10 }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { accessToken, isAdmin } = useAuth();
  const [totalPages, setTotalPages] = useState(1);

  // ✅ useCallback makes fetchUsers stable across renders
  const fetchUsers = useCallback(async () => {
    if (!accessToken || !isAdmin) return;

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setData(response.data);
      setTotalPages(response.data?.total_pages ?? 1);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
 
    
  }, [accessToken, isAdmin, page, limit]); // ✅ only re-create if these change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  return { data, loading, error, totalPages, refetch: fetchUsers };
}
