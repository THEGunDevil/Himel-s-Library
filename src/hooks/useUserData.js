"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/authContext";

export function useUserData({ page = 1, limit = 10 } = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1); // current page number
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const { accessToken, isAdmin } = useAuth();
  const fetchUser = useCallback(async () => {
    if (!accessToken && !isAdmin) return;

    setLoading(true);
    setError(null);

    try {
      let url;
      const params = new URLSearchParams({ page, limit });

      if (role) {
        url = `${
          process.env.NEXT_PUBLIC_API_URL
        }/users/role/${role}?${params.toString()}`;
      } else {
        url = `${process.env.NEXT_PUBLIC_API_URL}/users?${params.toString()}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Support paginated response: { users: [...], total_pages: N }
      setData(response.data?.users ?? response.data ?? []);
      setTotalPages(response.data?.total_pages ?? 1);
    } catch (err) {
      // If backend returns 403 but still includes data (e.g., banned user), keep it
      if (err.response?.status === 403 && err.response?.data) {
        setData(err.response.data);
      } else {
        const message =
          err.response?.data?.message || err.message || "Something went wrong";
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, limit, role]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { data, loading, error, totalPages, refetch: fetchUser };
}
