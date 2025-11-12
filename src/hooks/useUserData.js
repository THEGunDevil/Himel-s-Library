"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export function useSingleUserData(userID, accessToken) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userID || !accessToken) return;

    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/user`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setData(response.data);
      } catch (err) {
        console.error("❌ Failed to fetch user:", err);
        
        // Even if user is banned, we still got their data in the error
        if (err.response?.status === 403 && err.response?.data) {
          // Backend might still return user data in 403 response
          setData(err.response.data);
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userID, accessToken]);

  return { data, loading, error };
}