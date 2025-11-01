"use client";
import { useAuth } from "@/contexts/authContext";
import { Avatar, ConvertStringToDate, StarDisplay, StarRating } from "@/utils";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useBookReviews } from "@/hooks/useBookReviews";
import ReviewOptions from "./dropDownMenu";
import { toast } from "react-toastify";
export default function BookReviewSection({ bookId }) {
  const { accessToken } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: { comment: "", rating: 0 },
  });

  const rating = watch("rating");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const {
    data: allReviews,
    loading: reviewsLoading,
    error: reviewsError,
    deleteReview,
  } = useBookReviews(bookId);

  // Populate reviews state when allReviews changes
  useEffect(() => {
    if (allReviews) {
      setReviews(allReviews);
    }
  }, [allReviews]);

  async function onSubmit(data) {
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
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setReviews((prev) => [res.data.review, ...prev]);
      reset();
    } catch (err) {
      console.error("Failed to post review:", err);
      setError(
        err.response?.data?.error || "Failed to post review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }
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
              className="mt-1 w-full p-3 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent resize-none"
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
                {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-blue-500 text-white text-sm rounded-xl shadow-sm hover:bg-blue-600 hover:shadow transition-all duration-200 disabled:opacity-50"
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
        {reviews.length === 0 && !reviewsLoading ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No reviews yet — be the first to comment!
          </p>
        ) : (
          reviews.map((r,idx) => (
            <article
              key={r.id || idx}
              className="py-4 relative group hover:bg-gray-300 hover:transition-colors duration-200"
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
                    <div className="flex items-center gap-2">
                      <StarDisplay rating={r.rating} />
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <ReviewOptions
                          reviewID={r.id}
                          onDelete={async () => {
                            try {
                              await deleteReview(r.id); // use the hook here
                              toast.success("Review deleted ✅");
                              setReviews((prev) =>
                                prev.filter((rev) => rev.id !== r.id)
                              );
                            } catch (err) {
                              toast.error("Failed to delete review ❌");
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {r.comment}
                  </p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
