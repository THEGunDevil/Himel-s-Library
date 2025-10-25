import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/authContext";

export function useUserData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return; // ✅ wait for token before fetching

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(response.data);
        // console.log("Fetched users:", response.data);
        setData(response.data);
      } catch (err) {
        // console.error("❌ Failed to fetch users:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]); // ✅ re-run only when token changes

  return { data, loading, error };
}
