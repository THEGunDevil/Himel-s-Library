import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/authContext";

export function useBookReviews(bookId) {
  const { token } = useAuth();

  // Fetch reviews
  const [data, setData] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Delete review
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [reviewsByUser, setReviewsByUser] = useState([]);
  const [reviewsByUserLoading, setReviewsByUserLoading] = useState(false);
  const [reviewsByUserError, setReviewsByUserError] = useState(null);
  // Fetch reviews function (wrapped in useCallback so refetch always has latest bookId & token)
  const fetchReviews = useCallback(async () => {
    if (!bookId) return;
    setFetchLoading(true);
    setFetchError(null);

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/review/${bookId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch review:", err);
      setFetchError(err);
    } finally {
      setFetchLoading(false);
    }
  }, [bookId, token]); // ✅ useCallback ensures this always has latest bookId & token

  // Delete review function
  const deleteReview = async (reviewId) => {
    if (!token || !reviewId) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/review/${reviewId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Option 1: Remove from local state immediately
      setData((prev) => prev.filter((r) => r.id !== reviewId));

      // Option 2: Or refetch latest reviews
      // await fetchReviews();
    } catch (err) {
      console.error("❌ Failed to delete review:", err);
      setDeleteError(err);
    } finally {
      setDeleteLoading(false);
    }
  };
  const fetchReviewsByUserID = async (userId) => {
    if (!token || !userId) return;

    setReviewsByUserLoading(true);
    setReviewsByUserError(null);

    try {
      const res = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/review/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviewsByUser(res.data);
    } catch (err) {
      console.error("❌ Failed to delete review:", err);
      setReviewsByUserError(err);
    } finally {
      setReviewsByUserLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    data,
    fetchLoading,
    fetchError,
    deleteReview,
    deleteLoading,
    deleteError,
    reviewsByUser,
    reviewsByUserError,
    reviewsByUserLoading,
    refetch: fetchReviews,
    fetchReviewsByUserID,
  };
}
