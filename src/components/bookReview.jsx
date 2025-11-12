"use client";

import { useAuth } from "@/contexts/authContext";
import {
  Avatar,
  ConvertStringToDate,
  StarDisplay,
  StarRating,
} from "../../utils/utils";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useBookReviews } from "@/hooks/useBookReviews";
import axios from "axios";
import Options from "./options";

export default function BookReviewSection({ bookId }) {
  const { accessToken } = useAuth();
  const router = useRouter();

  const {
    data: reviews,
    fetchLoading: reviewsLoading,
    fetchError: reviewsError,
    deleteReview,
    updateReview,
  } = useBookReviews(bookId);

  const [localReviews, setLocalReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);

  useEffect(() => {
    if (reviews) setLocalReviews(reviews);
  }, [reviews]);

  // New review form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { comment: "", rating: 0 } });

  // Edit review form
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setEditValue,
    watch: watchEdit,
    formState: { errors: editErrors },
  } = useForm({ defaultValues: { comment: "", rating: 0 } });

  const rating = watch("rating");
  const editRating = watchEdit("rating");

  const [submitting, setSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [editError, setEditError] = useState(null);

  // Post new review
  const onSubmit = async (data) => {
    if (!accessToken) return;
    setSubmitting(true);
    setError(null);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/review`,
        {
          bookId,
          comment: data.comment,
          rating: data.rating,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // Refetch all reviews for this book
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/book/${bookId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setLocalReviews(res.data); // now includes user_name, created_at, etc.
      toast.success("Review posted ✅");
      reset();
    } catch (err) {
      console.error(err);
      setError("Failed to post review.");
      toast.error("Failed to post review ❌");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (review) => {
    setEditingReviewId(review.id);
    setEditValue("comment", review.comment);
    setEditValue("rating", review.rating);
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    resetEdit();
  };

  const onEditSubmit = async (data) => {
    if (!editingReviewId) return;

    setEditSubmitting(true);
    setEditError(null);

    try {
      await updateReview(editingReviewId, {
        comment: data.comment,
        rating: data.rating,
      });

      setLocalReviews((prev) =>
        prev.map((r) =>
          r.id === editingReviewId
            ? { ...r, comment: data.comment, rating: data.rating }
            : r
        )
      );

      toast.success("Review updated ✅");
      cancelEditing();
    } catch (err) {
      console.error(err);
      setEditError("Failed to update review.");
      toast.error("Failed to update review ❌");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!accessToken) return;

    try {
      await deleteReview(reviewId, accessToken);
      setLocalReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Review deleted ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete review ❌");
    }
  };

  return (
    <section className="bg-white w-full shadow-lg h-full p-6 flex flex-col mx-auto hover:shadow-xl transition-shadow duration-300">
      <header className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-blue-500">
          Readers' Reviews
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Share your thoughts — be kind and specific.
        </p>
      </header>

      {!accessToken && (
        <div className="w-full bg-blue-50 border border-blue-200 rounded-xl py-4 px-2 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-800 font-medium">
              Want to join the conversation?
            </p>
            <p className="text-xs text-blue-600">
              Sign in to share your thoughts and rate this book.
            </p>
          </div>
          <button
            onClick={() => router.push("/auth/log-in")}
            className="px-4 py-2 whitespace-nowrap bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg shadow-sm"
          >
            Log In
          </button>
        </div>
      )}

      {accessToken && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mb-8 w-full space-y-4"
        >
          <label className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">
              Your review
            </span>
            <textarea
              {...register("comment", { required: "Please write a comment." })}
              placeholder="What did you like? Any scenes, characters, or lines that stood out?"
              rows={3}
              maxLength={1000}
              className="mt-1 w-full p-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
            />
            {errors.comment && (
              <p className="text-sm text-red-600 mt-1">
                {errors.comment.message}
              </p>
            )}
          </label>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <StarRating
              rating={rating}
              setRating={(val) => setValue("rating", val)}
            />
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500">
                {localReviews.length} review
                {localReviews.length !== 1 ? "s" : ""}
              </p>
              <button
                type="submit"
                disabled={submitting || editingReviewId}
                className="px-5 py-2 bg-blue-500 text-white text-sm rounded-xl shadow-sm hover:bg-blue-600 disabled:opacity-50"
              >
                {submitting ? "Posting..." : "Post review"}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-500 mt-2 text-center">{error}</p>
          )}
        </form>
      )}

      {reviewsLoading && (
        <p className="text-center text-gray-500">Loading reviews...</p>
      )}

      <div className="divide-y divide-gray-200 w-full max-h-96 overflow-y-auto scrollbar-hide">
        {localReviews.length === 0 && !reviewsLoading ? (
          reviewsError ? (
            <p className="text-center text-red-500">Failed to load reviews.</p>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No reviews yet — be the first to comment!
            </p>
          )
        ) : (
          localReviews.map((r) => (
            <article
              key={r.id}
              className="group relative py-6 bg-white shadow-sm transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-full">
                  <div className="relative flex flex-row sm:items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar name={r.user_name} />
                      <div className="flex flex-col">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                          {r.user_name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {ConvertStringToDate(r.created_at)}
                        </span>
                        <div className="mt-1">
                          <StarDisplay rating={r.rating} />
                        </div>
                      </div>
                    </div>
                    <Options
                      onDelete={() => handleDelete(r.id)}
                      onEdit={() => startEditing(r)}
                    />
                  </div>

                  {editingReviewId === r.id ? (
                    <form
                      onSubmit={handleSubmitEdit(onEditSubmit)}
                      className="mt-4 space-y-4"
                    >
                      <textarea
                        {...registerEdit("comment", {
                          required: "Please write a comment.",
                        })}
                        rows={3}
                        maxLength={1000}
                        className="w-full p-3 border border-gray-200 rounded-md text-gray-800 focus:outline-none focus:border-blue-400 resize-none transition-colors duration-200"
                        placeholder="Edit your review..."
                      />
                      {editErrors.comment && (
                        <p className="text-sm text-red-600 mt-1">
                          {editErrors.comment.message}
                        </p>
                      )}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="sm:px-4 px-2 sm:py-2 py-1 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={editSubmitting}
                            className="sm:px-4 px-2 sm:py-2 py-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm duration-200"
                          >
                            {editSubmitting ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                      {editError && (
                        <p className="text-sm text-red-500 mt-2 text-center">
                          {editError}
                        </p>
                      )}
                    </form>
                  ) : (
                    <p className="mt-3 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                      {r.comment}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
