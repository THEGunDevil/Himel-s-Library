"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export function useSingleUserData(userID, accessToken) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    if (!userID || !accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/user/${userID}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setData(response.data);
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
  }, [userID, accessToken]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { data, loading, error, refetch: fetchUser };
}
