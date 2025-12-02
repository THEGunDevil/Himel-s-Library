"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import { useBookReviews } from "@/hooks/useBookReviews";
import {
  Avatar,
  ConvertStringToDate,
  StarDisplay,
  StarRating,
} from "../../utils/utils";
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
  const [submitting, setSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [editError, setEditError] = useState(null);

  // New review form
  const form = useForm({
    defaultValues: { comment: "", rating: 0 },
  });

  // Edit review form
  const editForm = useForm({
    defaultValues: { comment: "", rating: 0 },
  });

  useEffect(() => {
    if (reviews) setLocalReviews(reviews);
  }, [reviews]);

  const onSubmit = async (data) => {
    if (!accessToken) return;
    setSubmitting(true);
    setError(null);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/review`,
        {
          bookId,
          comment: data.comment || null,
          rating: data.rating === 0 ? null : data.rating,
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/book/${bookId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setLocalReviews(res.data);
      form.reset();
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
    editForm.setValue("comment", review.comment);
    editForm.setValue("rating", review.rating);
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    editForm.reset();
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
    <div className="flex h-full w-full flex-col bg-white dark:bg-slate-900 p-6 shadow-lg hover:shadow-xl">
      <header className="mb-6 text-center">
        <h2 className="text-2xl font-semibold text-blue-500">
          Readers' Reviews
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Share your thoughts — be kind and specific.
        </p>
      </header>

      {!accessToken && (
        <Alert variant="default" className="mb-6">
          <AlertTitle className="text-sm text-blue-800">
            Want to join the conversation?
          </AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <p className="text-xs text-blue-600">
              Sign in to share your thoughts and rate this book.
            </p>
            <Button
              onClick={() => router.push("/auth/log-in")}
              size="sm"
              className="whitespace-nowrap"
            >
              Log In
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {accessToken && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mb-8 space-y-4"
          >
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you like? Any scenes, characters, or lines that stood out?"
                      className="h-30 text-sm md:text-lg"
                      maxLength={1000}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <StarRating
                rating={form.watch("rating")}
                setRating={(val) => form.setValue("rating", val)}
              />
              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-500">
                  {localReviews.length} review
                  {localReviews.length !== 1 ? "s" : ""}
                </p>
                <Button
                  type="submit"
                  disabled={submitting || editingReviewId}
                  size="sm"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Post review"
                  )}
                </Button>
              </div>
            </div>
            {error && (
              <p className="mt-2 text-center text-sm text-red-500">{error}</p>
            )}
          </form>
        </Form>
      )}

      {reviewsLoading && (
        <p className="text-center text-gray-500">Loading reviews...</p>
      )}

      <ScrollArea className="h-96 w-full">
        {localReviews.length === 0 && !reviewsLoading ? (
          reviewsError ? (
            <p className="text-center text-red-500">Failed to load reviews.</p>
          ) : (
            <p className="py-4 text-center text-sm text-gray-500">
              No reviews yet — be the first to comment!
            </p>
          )
        ) : (
          localReviews.map((r) => (
            <article key={r.id} className="group py-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="w-full">
                  <div className="relative flex flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Avatar
                        type="comment_sec"
                        name={r.user_name}
                        profileImg={r.profile_img}
                      />
                      <div className="flex flex-col">
                        <h3 className="truncate text-sm dark:text-gray-200 font-semibold text-gray-900 sm:text-md">
                          {r.user_name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {ConvertStringToDate(r.created_at)}
                        </span>
                        <div className="mt-1">
                          {editingReviewId === r.id ? (
                            <StarRating
                              rating={form.watch("rating")}
                              setRating={(val) => form.setValue("rating", val)}
                            />
                          ) : (
                            <StarDisplay rating={r.rating} />
                          )}                        </div>
                      </div>
                    </div>
                    <Options
                      type="edit"
                      data={!!r.comment || !!r.rating}
                      onDelete={() => handleDelete(r.id)}
                      onEdit={() => startEditing(r)}
                    />
                  </div>

                  {editingReviewId === r.id ? (
                    <Form {...editForm}>
                      <form
                        onSubmit={editForm.handleSubmit(onEditSubmit)}
                        className="mt-4 space-y-4"
                      >
                        <FormField
                          control={editForm.control}
                          name="comment"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Edit your review..."
                                  rows={3}
                                  maxLength={1000}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={cancelEditing}
                              size="sm"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={editSubmitting}
                              size="sm"
                            >
                              {editSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Save Changes"
                              )}
                            </Button>
                          </div>
                        </div>
                        {editError && (
                          <p className="mt-2 text-center text-sm text-red-500">
                            {editError}
                          </p>
                        )}
                      </form>
                    </Form>
                  ) : (
                    <p className="mt-3 whitespace-pre-wrap dark:text-gray-200 text-sm leading-relaxed text-gray-600">
                      {r.comment}
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </ScrollArea>
    </div>
  );
}
