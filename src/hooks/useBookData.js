import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/authContext";

export function useBookData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/books/`
        );
        setData(response.data);
      } catch (err) {
        console.error("❌ Failed to fetch books:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [token]); // ✅ re-run only when token changes

  return { data, loading, error };
}
