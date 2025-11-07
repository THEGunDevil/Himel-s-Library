"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/authContext";

export function useReservations(bookID) {
  const [reservations, setReservations] = useState([]);
  const [reservationsByBookID, setReservationsByBookID] = useState([]);
  const [reservationsByBookIDAndUserID, setReservationsByBookIDAndUserID] =
    useState([]);
  const [reservationsByReserveID, setReservationsByReserveID] = useState([]);
  // Separate loading states
  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingFetchByBookID, setLoadingFetchByBookID] = useState(false);
  const [loadingFetchByBookIDAndUserID, setLoadingFetchByBookIDAndUserID] =
    useState(false);
  const [loadingFetchByReserveID, setLoadingFetchByReserveID] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Separate error states
  const [fetchError, setFetchError] = useState(null);
  const [fetchErrorByBookID, setFetchErrorByBookID] = useState(null);
  const [fetchErrorByBookIDAndUserID, setFetchErrorByBookIDAndUserID] =
    useState(null);
  const [fetchErrorByReserveID, setFetchErrorByReserveID] = useState(null);
  const [nextError, setNextError] = useState(null);
  const [createError, setCreateError] = useState(null);
  const [updateError, setUpdateError] = useState(null);

  const { accessToken, isAdmin } = useAuth();

  // Helper for error handling
  const handleError = (setter, err, defaultMessage) => {
    const message =
      err?.response?.data?.error || err?.message || defaultMessage;
    toast.error(message);
    setter(message);
    console.error(err);
    return message;
  };

  // Fetch all reservations (admin or user)
  const fetchReservations = useCallback(async () => {
    if (!accessToken) return;

    try {
      setLoadingFetch(true);
      setFetchError(null);

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations/`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setReservations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      handleError(setFetchError, err, "Failed to fetch reservations");
    } finally {
      setLoadingFetch(false);
    }
  }, [accessToken]);

  const fetchReservationsByReservationID = useCallback(
    async (bookID) => {
      if (!accessToken || !bookID) return;
      setLoadingFetchByReserveID(true);
      setFetchErrorByReserveID(null);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/reservations/reservation/${bookID}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setReservationsByReserveID(Array.isArray(res.data) ? res.data : []);
        return res.data;
      } catch (err) {
        handleError(
          setFetchErrorByReserveID,
          err,
          "Failed to fetch reservations"
        );
      } finally {
        setLoadingFetchByReserveID(false);
      }
    },
    [accessToken]
  );
  const fetchReservationsByBookID = useCallback(
    async (bookID) => {
      if (!accessToken || !bookID) return;
      try {
        setLoadingFetchByBookID(true);
        setFetchErrorByBookID(null);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/reservations/book/${bookID}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setReservationsByBookID(Array.isArray(res.data) ? res.data : []);
        return res.data;
      } catch (err) {
        handleError(setFetchErrorByBookID, err, "Failed to fetch reservations");
      } finally {
        setLoadingFetchByBookID(false);
      }
    },
    [accessToken]
  );
  const fetchReservationsByBookIDAndUserID = useCallback(
    async (bookID, userID) => {
      if (!accessToken || !bookID || !userID) return;
      setLoadingFetchByBookIDAndUserID(true);
      setFetchErrorByBookIDAndUserID(null);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/reservations/book/${bookID}?user_id=${userID}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        setReservationsByBookIDAndUserID(
          Array.isArray(res.data) ? res.data : []
        );
        return res.data;
      } catch (err) {
        handleError(
          setFetchErrorByBookIDAndUserID,
          err,
          "Failed to fetch reservations"
        );
      } finally {
        setLoadingFetchByBookIDAndUserID(false);
      }
    },
    [accessToken]
  );

  // Fetch next pending reservation for a book (admin)
  const fetchNextReservation = useCallback(
    async (bookId) => {
      if (!accessToken || !isAdmin) return;
      if (!bookId) {
        const msg = "Book ID is required to fetch next reservation";
        toast.error(msg);
        setNextError(msg);
        return;
      }

      try {
        setLoadingNext(true);
        setNextError(null);

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/reservations/next/${bookId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setReservations([res.data]);
        return res.data;
      } catch (err) {
        handleError(setNextError, err, "Failed to fetch next reservation");
      } finally {
        setLoadingNext(false);
      }
    },
    [accessToken, isAdmin]
  );

  // Create a new reservation (user)
  const createReservation = useCallback(
    async (userId, bookId) => {
      if (!accessToken)
        return handleError(setCreateError, null, "No access token");

      try {
        setLoadingCreate(true);
        setCreateError(null);

        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/reservations/`,
          { user_id: userId, book_id: bookId },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        // ✅ keep only one
        setReservations((prev) => [
          ...(Array.isArray(prev) ? prev : []),
          res.data,
        ]);
        return res.data;
      } catch (err) {
        return handleError(setCreateError, err, "Failed to create reservation");
      } finally {
        setLoadingCreate(false);
      }
    },
    [accessToken]
  );

  // Update reservation status (admin)
  const updateReservationStatus = useCallback(
    async (reservationId, status) => {
      if (!accessToken || !isAdmin)
        return handleError(setUpdateError, null, "Unauthorized");

      try {
        setLoadingUpdate(true);
        setUpdateError(null);

        const res = await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/reservations/${reservationId}/status`,
          { status },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        setReservations((prev) =>
          prev.map((r) => (r.id === reservationId ? { ...r, status } : r))
        );
        return res.data;
      } catch (err) {
        return handleError(setUpdateError, err, "Failed to update reservation");
      } finally {
        setLoadingUpdate(false);
      }
    },
    [accessToken, isAdmin]
  );

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  useEffect(() => {
    if (bookID) {
      fetchReservationsByBookID(bookID);
    }
  }, [bookID, fetchReservationsByBookID]);

  return {
    reservations,
    reservationsByBookID,
    reservationsByBookIDAndUserID,
    reservationsByReserveID,

    // Loading states
    loadingFetch,
    loadingNext,
    loadingCreate,
    loadingUpdate,
    loadingFetchByBookID,
    loadingFetchByBookIDAndUserID,
    loadingFetchByReserveID,

    // Error states
    fetchErrorByBookID,
    fetchErrorByBookIDAndUserID,
    fetchErrorByReserveID,
    fetchError,
    nextError,
    createError,
    updateError,

    // Actions
    refetch: fetchReservations,
    refetchByBookID: fetchReservationsByBookID,
    refetchByBookIDAndUserID: fetchReservationsByBookIDAndUserID,
    refetchByReservationID: fetchReservationsByReservationID,
    fetchNextReservation,
    createReservation,
    updateReservationStatus,
  };
}
