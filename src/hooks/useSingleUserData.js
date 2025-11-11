"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// useSingleUserData.js
export function useSingleUserData(userID, accessToken) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    if (!userID || !accessToken) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/users/user/${userID}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setData(res.data);
      
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userID, accessToken]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { data, loading, error, refetch: fetchUser };
}
