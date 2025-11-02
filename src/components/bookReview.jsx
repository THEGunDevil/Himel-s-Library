"use client";

import { useAuth } from "@/contexts/authContext";
import { Avatar, ConvertStringToDate, StarDisplay, StarRating } from "@/utils";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ReviewOptions from "./dropDownMenu";
import { useBookReviews } from "@/hooks/useBookReviews";
import axios from "axios";

export default function BookReviewSection({ bookId }) {
  const { accessToken } = useAuth();
  const router = useRouter();

  const {
    data: reviews,
    fetchLoading: reviewsLoading,
    fetchError: reviewsError,
    deleteReview,
    updateReview,
    refetch,
  } = useBookReviews(bookId);

  const [editingReviewId, setEditingReviewId] = useState(null);

  // Form for new review
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { comment: "", rating: 0 } });

  // Form for editing review
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

  // Submit new review
  const onSubmit = async (data) => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/review`,
        {
          bookId,
          comment: data.comment,
          rating: data.rating,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      toast.success("Review posted ✅");
      reset();
      refetch();
    } catch (err) {
      console.error(err);
      setError("Failed to post review.");
      toast.error("Failed to post review ❌");
    } finally {
      setSubmitting(false);
    }
  };

  // Start editing
  const startEditing = (review) => {
    setEditingReviewId(review.id);
    setEditValue("comment", review.comment);
    setEditValue("rating", review.rating);
    setEditError(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingReviewId(null);
    resetEdit();
  };

  // Submit edit
  const onEditSubmit = async (data) => {
    if (!editingReviewId) return;

    setEditSubmitting(true);
    setEditError(null);

    try {
      await updateReview(editingReviewId, {
        comment: data.comment,
        rating: data.rating,
      });
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
        <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
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
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg shadow-sm"
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
                {reviews ? reviews.length : 0} review
                {reviews && reviews.length !== 1 ? "s" : ""}
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
      {reviewsError && (
        <p className="text-center text-red-500">Failed to load reviews.</p>
      )}

      <div className="divide-y divide-gray-200 w-full max-h-96 overflow-y-auto scrollbar-hide">
        {reviews?.length === 0 && !reviewsLoading ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No reviews yet — be the first to comment!
          </p>
        ) : (
          reviews?.map((r) => (
            <article
              key={r.id}
              className="py-4 relative group hover:bg-gray-300 transition-colors duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Avatar name={r.user_name} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {r.user_name}
                      </h3>
                      <div className="text-xs text-gray-400">
                        {ConvertStringToDate(r.created_at)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                      <StarDisplay rating={r.rating} />
                      <ReviewOptions
                        onDelete={async () => {
                          await deleteReview(r.id);
                          toast.success("Review deleted ✅");
                        }}
                        onEdit={() => startEditing(r)}
                      />
                    </div>
                  </div>

                  {editingReviewId === r.id ? (
                    <form
                      onSubmit={handleSubmitEdit(onEditSubmit)}
                      className="mt-4 w-full space-y-4"
                    >
                      <textarea
                        {...registerEdit("comment", {
                          required: "Please write a comment.",
                        })}
                        rows={3}
                        maxLength={1000}
                        className="mt-1 w-full p-3 border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                      />
                      {editErrors.comment && (
                        <p className="text-sm text-red-600 mt-1">
                          {editErrors.comment.message}
                        </p>
                      )}

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <StarRating
                          rating={editRating}
                          setRating={(val) => setEditValue("rating", val)}
                        />
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="px-5 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={editSubmitting}
                            className="px-5 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                          >
                            {editSubmitting ? "Saving..." : "Save changes"}
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
                    <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
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
