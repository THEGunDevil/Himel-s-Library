"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/authContext";
import { useParams, useRouter } from "next/navigation";
import { useSingleBookData } from "@/hooks/useSingleBookData";
import BookReviewSection from "@/components/bookReview";
import { getDueDate } from "../../../../utils/utils";
import { useReservations } from "@/hooks/useReservation";
import { toast } from "react-toastify";
import {
  handleCancelReserve,
  handleReserve,
} from "../../../../utils/userActions";
import { useBorrowData } from "@/hooks/useBorrowData";
import Image from "next/image";
import SubscriptionPlans from "@/components/subscriptionPlan";

export default function Book() {
  const { accessToken, userID, user } = useAuth();
  const { id } = useParams();
  const router = useRouter();

  // -- State --
  const [book, setBook] = useState(null);
  const [borrowed, setBorrowed] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state for Borrow action
  const [loadingPlans, setLoadingPlans] = useState(false); // Loading state for fetching plans
  const [error, setError] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [localReserves, setLocalReserves] = useState(null);
  const [openSubscriptionPlan, setOpenSubscriptionPlan] = useState(false);
  const [plans, setPlans] = useState();
  const [loadingPlanID, setLoadingPlanID] = useState(null);
  const [payment, setPayment] = useState({
    payment: null,
    loadingPayment: false,
    paymentError: null,
  });
  // -- Hooks --
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

  // -- Effects --

  // 1. Sync Book Data
  useEffect(() => {
    if (bookData) setBook(bookData);
  }, [bookData]);

  // 2. Sync Local Reserves
  useEffect(() => {
    if (reservationsByBookIDAndUserID?.length)
      setLocalReserves(reservationsByBookIDAndUserID[0]);
    else setLocalReserves(null);
  }, [reservationsByBookIDAndUserID]);

  // 3. Fetch User Reservation on load
  useEffect(() => {
    if (!bookData?.id || !userID || !accessToken) return;
    const fetchUserReservation = async () => {
      const res = await refetchByBookIDAndUserID(bookData.id, userID);
      setLocalReserves(res?.[0] || null);
    };
    fetchUserReservation();
  }, [bookData?.id, userID, accessToken, refetchByBookIDAndUserID]);

  // 4. Fetch Borrow Info
  useEffect(() => {
    const fetchBorrow = async () => {
      if (!id || !accessToken) return;
      try {
        const resp = await fetchBorrowsByBookIDAndUserID(id);
        if (!resp || resp.length === 0) {
          setBorrow([]);
          setBorrowed(false);
        } else {
          setBorrow(resp);
          setBorrowed(resp[0]?.returned_at === null);
        }
      } catch (err) {
        console.warn("No borrow record found", err);
        setBorrow([]);
        setBorrowed(false);
      }
    };
    fetchBorrow();
  }, [id, accessToken, fetchBorrowsByBookIDAndUserID]);

  const handleSelectPlan = async (planID) => {
    if (!planID || !userID) return;
    setPayment((prev) => ({ ...prev, loadingPayment: true }));
    setLoadingPlanID(planID);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/payment`,
        {
          user_id: userID,
          plan_id: planID,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setPayment((prev) => ({
        ...prev,
        loadingPayment: true,
        payment: res.data.redirect_url,
      }));
      console.log(res.data.redirect_url);
      window.location.href = res.data.redirect_url; // send user to Stripe checkout
    } catch (error) {
      setPayment((prev) => ({ ...prev, paymentError: error }));
      console.log(error);
    } finally {
      setPayment((prev) => ({ ...prev, loadingPayment: false }));
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

      // 1️⃣ Check subscription status
      let sub = null;
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/subscription/${userID}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        sub = data.subscription || null;
      } catch (err) {
        // If 404, it just means no subscription exists, which is fine
        if (err.response?.status !== 404) {
          console.error(err);
        }
      }

      // 2️⃣ If inactive or missing, show plans
      if (!sub || sub.status !== "active") {
        setLoadingPlans(true);
        // Open the modal immediately so the user knows something is happening
        setOpenSubscriptionPlan(true);
        try {
          const { data: subscriptionPlansData } = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/subscription-plan/`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          setPlans(
            Array.isArray(subscriptionPlansData?.plans)
              ? subscriptionPlansData?.plans
              : []
          );
        } catch (fetchErr) {
          console.error("Error fetching plans:", fetchErr);
          toast.error("Failed to load subscription plans.");
        } finally {
          setLoadingPlans(false);
          setLoading(false); // Stop the borrow loading spinner
        }
        return; // Stop execution here
      }

      // 3️⃣ Borrow book (Only if subscription is active)
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

  // -- Render --

  if (bookLoading || !book)
    return (
      <div className="p-6 flex justify-center text-lg">
        Loading book details...
      </div>
    );
  if (bookError)
    return (
      <div className="p-6 text-red-500 text-center">
        Failed to load book. Please try again later.
      </div>
    );

  return (
    <>
      <section className="flex flex-col w-full lg:flex-row md:pt-36 pt-32 justify-between gap-5 items-start xl:px-20 lg:px-20 px-4 mb-10">
        {/* Left Column: Book Info Card */}
        <div className="bg-white w-full lg:w-1/2 shadow-lg p-6 flex flex-col items-center hover:shadow-xl transition-shadow duration-300 h-auto lg:h-[700px] xl:h-[720px]">
          {/* Book Cover */}
          <div className="relative w-full flex justify-center items-center h-60 bg-gray-50 rounded-lg overflow-hidden">
            {book.image_url ? (
              <Image
                src={book.image_url}
                alt={book.title}
                fill
                className="object-contain brightness-90"
                priority
              />
            ) : (
              <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                No Cover
              </div>
            )}
            {borrowed && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                Borrowed
              </span>
            )}
            {!borrowed && borrow?.[0]?.returned_at === null && (
              <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                Active Loan
              </span>
            )}
          </div>

          <h2 className="mt-4 font-bold text-xl text-center line-clamp-2 text-gray-800">
            {book.title}
          </h2>
          <p className="text-gray-600 text-sm text-center mt-1 font-medium">
            {book.author}
          </p>
          {book.description && (
            <p className="mt-3 text-gray-500 text-sm text-center line-clamp-3 leading-relaxed">
              {book.description}
            </p>
          )}
          <p className="mt-2 text-gray-400 text-xs text-center uppercase tracking-wide">
            Genre:{" "}
            {Array.isArray(book.genre) ? book.genre.join(", ") : book.genre}
          </p>

          {/* Availability Badge */}
          <div className="mt-4 flex justify-center gap-2 items-center w-full">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                book.available_copies > 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {book.available_copies > 0 ? "Available" : "Unavailable"}
            </span>
            {book.available_copies > 0 && (
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs rounded-full font-bold border border-blue-100">
                {book.available_copies}{" "}
                {book.available_copies > 1 ? "copies" : "copy"}
              </span>
            )}
          </div>

          {/* Borrow Form */}
          {!borrowed && book.available_copies > 0 && (
            <div className="mt-6 w-full max-w-xs flex flex-col items-center bg-gray-50 p-4 rounded-xl">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Select Due Date
              </label>
              <select
                className="border border-gray-300 bg-white rounded-lg px-3 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              >
                <option value="">-- Choose duration --</option>
                <option value={getDueDate(7)}>1 week</option>
                <option value={getDueDate(14)}>2 weeks</option>
                <option value={getDueDate(21)}>3 weeks</option>
              </select>

              {accessToken ? (
                <button
                  onClick={handleBorrow}
                  disabled={loading || !dueDate}
                  className={`mt-4 w-full py-2.5 rounded-lg text-white font-medium text-sm transition-all shadow-sm 
                    ${
                      loading || !dueDate
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                    }`}
                >
                  {loading ? "Processing..." : "Borrow Book"}
                </button>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="mt-4 w-full py-2 text-sm text-blue-600 hover:underline"
                >
                  Log in to borrow
                </button>
              )}
            </div>
          )}

          {/* Reservation Section (Only if 0 copies) */}
          {book.available_copies === 0 && (
            <div className="mt-8 w-full max-w-xs flex flex-col items-center gap-3">
              {(!localReserves || localReserves?.status === "cancelled") && (
                <button
                  className="w-full py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium transition shadow"
                  disabled={loadingCreate}
                  onClick={handleReserveClick}
                >
                  {loadingCreate ? "Processing..." : "Reserve This Book"}
                </button>
              )}
              {localReserves?.status === "pending" &&
                localReserves?.user_id === userID && (
                  <button
                    className="w-full py-2 bg-white border border-red-500 text-red-500 hover:bg-red-50 rounded-lg font-medium transition"
                    disabled={loadingUpdate}
                    onClick={handleCancelClick}
                  >
                    {loadingUpdate ? "Cancelling..." : "Cancel Reservation"}
                  </button>
                )}
              {localReserves?.status === "fulfilled" && (
                <div className="w-full p-2 bg-blue-100 text-blue-800 rounded text-center text-sm font-medium">
                  Reservation Fulfilled
                </div>
              )}
            </div>
          )}

          {/* Error Messages */}
          {createError && (
            <p className="mt-3 font-medium text-red-500 text-xs text-center bg-red-50 p-1 w-full rounded">
              {createError}
            </p>
          )}
          {error && (
            <p className="mt-3 font-medium text-red-500 text-xs text-center bg-red-50 p-1 w-full rounded">
              {error}
            </p>
          )}
        </div>

        {/* Right Column: Reviews */}
        <div className="w-full lg:w-1/2 h-auto lg:h-[700px] xl:h-[720px]">
          <BookReviewSection bookId={book.id} />
        </div>
      </section>

      {/* --- Subscription Modal --- */}
      {openSubscriptionPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 relative max-h-[90vh] overflow-y-auto animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition bg-gray-100 rounded-full p-1 w-8 h-8 flex items-center justify-center"
              onClick={() => setOpenSubscriptionPlan(false)}
            >
              ✕
            </button>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800">
                Active Subscription Required
              </h3>
              <p className="text-gray-500 mt-2">
                Please choose a plan to continue reading.
              </p>
            </div>

            {loadingPlans ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-500">Loading plans...</span>
              </div>
            ) : plans.length > 0 ? (
              <SubscriptionPlans
                plans={plans}
                onSelectPlan={handleSelectPlan}
              />
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-xl">
                <p className="text-gray-500 font-medium">
                  No subscription plans are currently available.
                </p>
                <p className="text-sm text-gray-400">Please contact support.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
