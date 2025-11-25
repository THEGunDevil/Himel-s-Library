"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/authContext";
import { useSingleBookData } from "@/hooks/useSingleBookData";
import { useReservations } from "@/hooks/useReservation";
import { useBorrowData } from "@/hooks/useBorrowData";
import BookReviewSection from "@/components/bookReview";
import SubscriptionPlans from "@/components/subscriptionPlan";
import { getDueDate } from "../../../../utils/utils";
import {
  handleCancelReserve,
  handleReserve,
} from "../../../../utils/userActions";
import Loader from "@/components/loader";

export default function Book() {
  const { accessToken, userID, user } = useAuth();
  const { id } = useParams();
  const router = useRouter();

  // States
  const [book, setBook] = useState(null);
  const [borrowed, setBorrowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [error, setError] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [localReserves, setLocalReserves] = useState(null);
  const [openSubscriptionPlan, setOpenSubscriptionPlan] = useState(false);
  const [plans, setPlans] = useState([]);
  const [loadingPlanID, setLoadingPlanID] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Hooks
  const { fetchBorrowsByBookIDAndUserID, borrow, setBorrow } = useBorrowData({
    bookID: id,
  });

  const {
    loadingCreate,
    createError,
    createReservation,
    loadingUpdate,
    updateReservationStatus,
    refetchByBookIDAndUserID,
    reservationsByBookIDAndUserID,
  } = useReservations();

  const {
    data: bookData,
    loading: bookLoading,
    error: bookError,
  } = useSingleBookData(id);

  // Effects
  useEffect(() => {
    if (bookData) setBook(bookData);
  }, [bookData]);

  useEffect(() => {
    if (reservationsByBookIDAndUserID?.length) {
      setLocalReserves(reservationsByBookIDAndUserID[0]);
    } else {
      setLocalReserves(null);
    }
  }, [reservationsByBookIDAndUserID]);

  useEffect(() => {
    if (!bookData?.id || !userID || !accessToken) return;
    refetchByBookIDAndUserID(bookData.id, userID).then((res) => {
      setLocalReserves(res?.[0] || null);
    });
  }, [bookData?.id, userID, accessToken, refetchByBookIDAndUserID]);

  useEffect(() => {
    if (!id || !accessToken) return;
    fetchBorrowsByBookIDAndUserID(id)
      .then((resp) => {
        if (!resp || resp.length === 0) {
          setBorrow([]);
          setBorrowed(false);
        } else {
          setBorrow(resp);
          setBorrowed(resp[0]?.returned_at === null);
        }
      })
      .catch((err) => {
        if (err.status === 404) {
          console.info("No borrow record found (handled 404)"); // Info, not an error
        } else {
          console.error("Severe server error:", err); // True error
        }
        setBorrow([]);
        setBorrowed(false);
      });
  }, [id, accessToken, fetchBorrowsByBookIDAndUserID, setBorrow]);

  // Handlers
  const handleSelectPlan = async (planID) => {
    if (!planID || !userID) return;
    setPaymentLoading(true);
    setLoadingPlanID(planID);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/payment`,
        { user_id: userID, plan_id: planID },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      window.location.href = res.data.redirect_url;
    } catch (error) {
      setPaymentError(error);
    } finally {
      setPaymentLoading(false);
      setLoadingPlanID(null);
    }
  };

  const handleBorrow = async () => {
    if (!accessToken || !user) {
      setError("You must be logged in to borrow a book.");
      return;
    }
    if (!book?.id || !dueDate) return;

    try {
      setLoading(true);
      setError(null);

      // Check subscription status
      let sub = null;
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/subscription/${userID}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        sub = data.subscription || null;
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error(err);
        }
      }

      // If inactive or missing, show plans
      if (!sub || sub.status !== "active") {
        setLoadingPlans(true);
        setOpenSubscriptionPlan(true);
        try {
          const { data: subscriptionPlansData } = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/subscription-plan/`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          setPlans(
            Array.isArray(subscriptionPlansData?.plans)
              ? subscriptionPlansData.plans
              : []
          );
        } catch (fetchErr) {
          console.error("Error fetching plans:", fetchErr);
          toast.error("Failed to load subscription plans.");
        } finally {
          setLoadingPlans(false);
        }
        return;
      }

      // Borrow book if subscription is active
      const formattedDueDate = new Date(dueDate).toISOString();
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/borrows/borrow`,
        { book_id: book.id, due_date: formattedDueDate },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setBorrowed(true);
      setBook((prev) => ({
        ...prev,
        available_copies: Math.max(prev.available_copies - 1, 0),
      }));

      toast.success("Book borrowed successfully!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to borrow the book.");
    } finally {
      setLoading(false);
    }
  };

  const handleReserveClick = () =>
    handleReserve({
      userID,
      book,
      localReserves,
      setLocalReserves,
      createReservation,
      updateReservationStatus,
      refetchByBookIDAndUserID,
      toast,
    });

  const handleCancelClick = () =>
    handleCancelReserve({
      localReserves,
      setLocalReserves,
      updateReservationStatus,
      refetchByBookIDAndUserID,
      toast,
    });

  // Render
  if (bookLoading || !book) {
    return (
      <div className="flex h-screen items-center justify-center text-lg">
        <Loader />
      </div>
    );
  }

  if (bookError) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        Failed to load book. Please try again later.
      </div>
    );
  }

  return (
    <>
      <section className="mb-10 flex w-full flex-col gap-5 pt-32 md:pt-36 lg:flex-row lg:px-20 xl:px-20">
        {/* Book Info Card */}
        <Card className="flex h-auto w-full flex-col items-center justify-between lg:h-[720px] lg:w-1/2 xl:h-[720px] rounded-none">
          <CardHeader className="w-full">
            <div className="relative mx-auto h-60 w-48 overflow-hidden rounded-lg bg-gray-50">
              {book.image_url ? (
                <Image
                  src={book.image_url}
                  alt={book.title}
                  fill
                  className="object-contain brightness-90"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200 font-medium text-gray-500">
                  No Cover
                </div>
              )}
              {borrowed && (
                <Badge className="absolute left-2 top-2" variant="destructive">
                  Borrowed
                </Badge>
              )}
              {!borrowed && borrow?.[0]?.returned_at === null && (
                <Badge className="absolute left-2 top-2" variant="secondary">
                  Active Loan
                </Badge>
              )}
            </div>
            <CardTitle className="mt-4 text-center text-xl">
              {book.title}
            </CardTitle>
            <CardDescription className="text-center text-sm font-medium">
              {book.author}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {book.description && (
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {book.description}
              </p>
            )}
            <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
              Genre:{" "}
              {Array.isArray(book.genre) ? book.genre.join(", ") : book.genre}
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Badge
                variant="secondary"
                className={
                  book.available_copies > 0 ? "bg-green-100" : "bg-red-100"
                }
              >
                {book.available_copies > 0 ? "Available" : "Unavailable"}
              </Badge>
              {book.available_copies > 0 && (
                <Badge variant="outline">
                  {book.available_copies}{" "}
                  {book.available_copies > 1 ? "copies" : "copy"}
                </Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="w-full flex-col items-center">
            {!borrowed && book.available_copies > 0 && (
              <div className="w-full max-w-xs flex flex-col items-center">
                <label className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">
                  Select Due Date
                </label>
                <Select
                  value={dueDate}
                  onValueChange={(value) => setDueDate(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="-- Choose duration --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={getDueDate(7)}>1 week</SelectItem>
                    <SelectItem value={getDueDate(14)}>2 weeks</SelectItem>
                    <SelectItem value={getDueDate(21)}>3 weeks</SelectItem>
                  </SelectContent>
                </Select>
                {accessToken ? (
                  <Button
                    onClick={handleBorrow}
                    disabled={loading || !dueDate}
                    className="mt-4 w-full"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Borrow Book"
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="link"
                    onClick={() => router.push("/login")}
                    className="mt-4 w-full"
                  >
                    Log in to borrow
                  </Button>
                )}
              </div>
            )}
            {book.available_copies === 0 && (
              <div className="mt-4 w-full max-w-xs space-y-3">
                {(!localReserves || localReserves?.status === "cancelled") && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    disabled={loadingCreate}
                    onClick={handleReserveClick}
                  >
                    {loadingCreate ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Reserve This Book"
                    )}
                  </Button>
                )}
                {localReserves?.status === "pending" &&
                  localReserves?.user_id === userID && (
                    <Button
                      variant="destructive"
                      className="w-full"
                      disabled={loadingUpdate}
                      onClick={handleCancelClick}
                    >
                      {loadingUpdate ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Cancel Reservation"
                      )}
                    </Button>
                  )}
                {localReserves?.status === "fulfilled" && (
                  <Badge className="w-full justify-center" variant="secondary">
                    Reservation Fulfilled
                  </Badge>
                )}
              </div>
            )}
            {createError && (
              <p className="mt-3 w-full rounded bg-red-50 p-1 text-center text-xs font-medium text-red-500">
                {createError}
              </p>
            )}
            {error && (
              <p className="mt-3 w-full rounded bg-red-50 p-1 text-center text-xs font-medium text-red-500">
                {error}
              </p>
            )}
          </CardFooter>
        </Card>

        {/* Reviews Section */}
        <div className="h-auto w-full lg:h-[720px] lg:w-1/2 xl:h-[720px]">
          <BookReviewSection bookId={book.id} />
        </div>
      </section>

      {/* Subscription Modal */}
      {openSubscriptionPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-4xl animate-fadeIn rounded-2xl bg-white shadow-2xl">
            <button
              className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition hover:text-gray-800 sm:right-10 sm:top-10"
              onClick={() => setOpenSubscriptionPlan(false)}
            >
              ✕
            </button>
            <div className="max-h-[90vh] overflow-y-auto p-6">
              <div className="mb-8 text-center">
                <h3 className="text-2xl font-bold text-gray-800">
                  Active Subscription Required
                </h3>
                <p className="mt-2 text-gray-500">
                  Please choose a plan to continue reading.
                </p>
              </div>
              {loadingPlans ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-gray-500">Loading plans...</span>
                </div>
              ) : plans.length > 0 ? (
                <SubscriptionPlans
                  plans={plans}
                  onSelectPlan={handleSelectPlan}
                  loadingPlanID={loadingPlanID}
                />
              ) : (
                <div className="rounded-xl bg-gray-50 py-10 text-center">
                  <p className="font-medium text-gray-500">
                    No subscription plans are currently available.
                  </p>
                  <p className="text-sm text-gray-400">
                    Please contact support.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
