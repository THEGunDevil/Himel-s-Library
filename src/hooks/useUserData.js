"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/authContext";

export function useUserData({ page = 1, limit = 10 } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const { accessToken, isAdmin } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (!accessToken || !isAdmin) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit });
      const url = `${
        process.env.NEXT_PUBLIC_API_URL
      }/users/?${params.toString()}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` }, // ✅ fixed
      });

      setData(res.data?.users ?? []);
      setTotalPages(res.data?.total_pages ?? 1);
    } catch (err) {
      setError(err);
      console.error(
        "❌ Failed to fetch users:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAdmin, page, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { data, loading, error, totalPages, refetch: fetchUsers };
}
