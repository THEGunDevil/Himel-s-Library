import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/authContext";

export function useBookReviews(bookId) {
  const { accessToken } = useAuth();

  // State for all reviews of a book
  const [data, setData] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Delete states
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Update states
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // Reviews by user
  const [reviewsByUser, setReviewsByUser] = useState([]);
  const [reviewsByUserLoading, setReviewsByUserLoading] = useState(false);
  const [reviewsByUserError, setReviewsByUserError] = useState(null);

  // Fetch all reviews for a book
  const fetchReviews = useCallback(async () => {
    if (!bookId) return;
    setFetchLoading(true);
    setFetchError(null);

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/book/${bookId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setData(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch review:", err);
      setFetchError(err);
    } finally {
      setFetchLoading(false);
    }
  }, [bookId, accessToken]);

  // Delete a review
  const deleteReview = async (reviewId) => {
    if (!accessToken || !reviewId) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/review/${reviewId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setData((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      console.error("❌ Failed to delete review:", err);
      setDeleteError(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ✅ Update (edit) a review
  const updateReview = async (reviewId, updatedFields) => {
    if (!accessToken || !reviewId) return;

    setUpdateLoading(true);
    setUpdateError(null);

    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/review/${reviewId}`,
        updatedFields,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // Update local state immediately
      setData((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, ...res.data } : r))
      );
    } catch (err) {
      console.error("❌ Failed to update review:", err);
      setUpdateError(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  // ✅ Fetch reviews by user
  const fetchReviewsByUserID = async (userId) => {
    if (!accessToken || !userId) return;

    setReviewsByUserLoading(true);
    setReviewsByUserError(null);

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/user/${userId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setReviewsByUser(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch user reviews:", err);
      setReviewsByUserError(err);
    } finally {
      setReviewsByUserLoading(false);
    }
  };

  // Auto-fetch when bookId changes
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

    updateReview,
    updateLoading,
    updateError,

    reviewsByUser,
    reviewsByUserError,
    reviewsByUserLoading,
    setReviewsByUser,
    refetch: fetchReviews,
    fetchReviewsByUserID,
  };
}
