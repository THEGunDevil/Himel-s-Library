"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/authContext";

export function useBookReviews(bookId) {
  const { accessToken } = useAuth();

  // --- State ---
  const [data, setData] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const [reviewsByUser, setReviewsByUser] = useState([]);
  const [reviewsByUserLoading, setReviewsByUserLoading] = useState(false);
  const [reviewsByUserError, setReviewsByUserError] = useState(null);

  // --- Fetch all reviews for a book ---
  const fetchReviews = useCallback(async () => {
    // Prevent fetching if no bookId or no token
    if (!bookId || !accessToken) return;

    setFetchLoading(true);
    setFetchError(null);

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/book/${bookId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setData(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch reviews:", err);
      setFetchError(err);
    } finally {
      setFetchLoading(false);
    }
  }, [bookId, accessToken]);

  // --- Delete a review ---
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

  // --- Update a review ---
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

      const updatedReview = res.data.review || {};
      setData((prev) =>
        (prev || []).map((r) =>
          r.id === reviewId ? { ...r, ...updatedReview } : r
        )
      );
    } catch (err) {
      console.error("❌ Failed to update review:", err);
      setUpdateError(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  // --- Fetch reviews by user ---
  const fetchReviewsByUserID = useCallback(
    async (userId) => {
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
    },
    [accessToken]
  );

  // --- Auto-fetch reviews when bookId or accessToken changes ---
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    // Reviews data
    data,
    fetchLoading,
    fetchError,
    refetch: fetchReviews,

    // Delete
    deleteReview,
    deleteLoading,
    deleteError,

    // Update
    updateReview,
    updateLoading,
    updateError,

    // Reviews by user
    reviewsByUser,
    reviewsByUserLoading,
    reviewsByUserError,
    setReviewsByUser,
    fetchReviewsByUserID,
  };
}
