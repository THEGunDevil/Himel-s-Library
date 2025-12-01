// utils/userActions.js
import { toast } from "react-toastify";
import axios from "axios";

export const handleBan = async ({
  userId,
  formData,
  isAdmin,
  accessToken,
  refetch,
  resetBanID,
}) => {
  if (!userId) return;
  if (!isAdmin || !accessToken) {
    toast.error("You are not authorized to ban users.");
    return;
  }

  try {
    const banUntilDate = formData.ban_until
      ? new Date(formData.ban_until).toISOString()
      : null;

    const isPermanent = !banUntilDate;

    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/user/ban/${userId}`,
      {
        is_banned: true,
        ban_reason: formData.ban_reason,
        ban_until: banUntilDate,
        is_permanent_ban: isPermanent,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    toast.success("User banned successfully!");
    if (resetBanID) resetBanID();
    if (refetch) refetch();
  } catch (err) {
    console.error("Ban error:", err.response?.data || err);
    toast.error("Failed to ban user.");
  }
};

export const handleUnban = async ({
  userId,
  isAdmin,
  accessToken,
  refetch,
  resetUnBanID,
}) => {
  if (!isAdmin || !accessToken) {
    toast.error("You are not authorized to unban users.");
    return;
  }

  try {
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/user/ban/${userId}`,
      {
        is_banned: false,
        ban_reason: "",
        ban_until: null,
        is_permanent_ban: false,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    toast.success("User unbanned successfully!");
    if (resetUnBanID) resetUnBanID();
    if (refetch) refetch();
  } catch (err) {
    console.error("Unban error:", err);
    toast.error("Failed to unban user.");
  }
};

export const handleDelete = async ({
  type,
  userId,
  accessToken,
  setProfile,
  setReviewsByUser,
}) => {
  let originalReviews;

  try {
    //
    // DELETE BIO
    //
    if (type === "bio") {
      if (!userId || !accessToken) return;

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/user/${userId}`,
        { bio: "" },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (setProfile) {
        setProfile((prev) => ({
          ...prev,
          user: [
            {
              ...prev.user[0],
              bio: null,
            },
          ],
        }));
      }

      toast.success("Bio deleted successfully!");
      return;
    }

    //
    // DELETE PROFILE IMAGE
    //
    if (type === "delete_profile_img") {
      if (!userId || !accessToken) return;

      // DELETE request to backend
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/users/user/${userId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // Update state correctly (matches UserResponse shape)
      if (setProfile) {
        setProfile((prev) => ({
          ...prev,
          user: prev.user.map((u) =>
            u.id === userId
              ? { ...u, profile_img: null, profile_img_public_id: null }
              : u
          ),
        }));
      }

      toast.success("Profile image deleted successfully!");
      return;
    }

    throw new Error("Invalid type for deletion");
  } catch (err) {
    console.error("Delete error:", err.response?.data || err);
    toast.error("Failed to delete.");

    if (type === "review" && originalReviews && setReviewsByUser) {
      setReviewsByUser(originalReviews);
    }
  }
};

export const handleEditSubmit = async ({
  reviewId,
  editedComment,
  editedRating,
  reviewsByUser,
  setReviewsByUser,
  updateReview,
  userId,
  editedBio,
  setProfile,
  accessToken,
  cancelEditing,
}) => {
  try {
    if (
      reviewId &&
      editedComment &&
      editedRating &&
      reviewsByUser &&
      setReviewsByUser &&
      updateReview
    ) {
      const updatedReview = {
        ...reviewsByUser.find((r) => r.id === reviewId),
        comment: editedComment,
        rating: editedRating,
      };

      setReviewsByUser((prev) =>
        prev.map((r) => (r.id === reviewId ? updatedReview : r))
      );

      await updateReview(reviewId, {
        comment: editedComment,
        rating: editedRating,
      });

      toast.success("Review updated ✅");
    } else if (userId && editedBio && setProfile && accessToken) {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/user/${userId}`,
        { bio: editedBio },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setProfile((prev) => ({
        ...prev,
        user: [{ ...prev.user[0], bio: editedBio }],
      }));

      toast.success("Bio updated ✅");
    } else {
      throw new Error("Invalid parameters for edit submission");
    }

    if (cancelEditing) cancelEditing();
  } catch (err) {
    console.error("Edit error:", err.response?.data || err);
    if (reviewId && reviewsByUser && setReviewsByUser) {
      // Revert review update on error
      setReviewsByUser([...reviewsByUser]);
      toast.error("Failed to update review ❌");
    } else if (userId && setProfile) {
      // Revert bio update on error
      toast.error("Failed to update bio ❌");
    }
  }
};
export const handleProfileImageChange = async (
  e,
  userId,
  accessToken,
  setProfile
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("profile_img", file);

  try {
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/user/${userId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    toast.success("Profile picture set successfully");
    // refresh profile in UI
    setProfile((prev) => ({
      ...prev,
      user: [
        {
          ...prev.user[0],
          profile_img: response.data.profile_img,
        },
      ],
    }));
  } catch (error) {
    console.error(error);
    toast.error("❌ There was an error setting profile picture");
  }
};

export const handleReserve = async ({
  userID,
  book,
  localReserves,
  setLocalReserves,
  createReservation,
  updateReservationStatus,
  refetchByBookIDAndUserID,
  toast,
}) => {
  if (!userID || !book?.id) return;

  try {
    if (localReserves?.status === "cancelled") {
      setLocalReserves({ ...localReserves, status: "pending" });
      await updateReservationStatus(localReserves.id, "pending");
      toast.success("Your cancelled reservation has been reactivated");
    } else {
      setLocalReserves({ status: "pending", book_id: book.id });
      await createReservation(userID, book.id);
      toast.success("A reservation for this book has been placed");
    }
    await refetchByBookIDAndUserID(book.id, userID);
  } catch {
    if (localReserves?.status === "cancelled") {
      setLocalReserves({ ...localReserves, status: "cancelled" });
    } else {
      setLocalReserves(null);
    }
    toast.error("Failed to place or reactivate the reservation");
  }
};

export const handleCancelReserve = async ({
  localReserves,
  setLocalReserves,
  updateReservationStatus,
  refetchByBookIDAndUserID,
  toast,
}) => {
  if (!localReserves?.id) return;

  try {
    setLocalReserves({ ...localReserves, status: "cancelled" });
    await updateReservationStatus(localReserves.id, "cancelled");
    toast.success("Reservation cancelled successfully");
    await refetchByBookIDAndUserID(localReserves.book_id);
  } catch {
    setLocalReserves({ ...localReserves, status: "pending" });
    toast.error("Failed to cancel the reservation");
  }
};

export async function updateReservationStatus({
  reservation,
  setLocalReservation,
  updateReservationStatus,
  refetch,
  newStatus,
  toast,
}) {
  if (!reservation?.id) {
    toast.error("Invalid reservation");
    return false;
  }

  const originalReservation = { ...reservation };

  try {
    setLocalReservation({ ...reservation, status: newStatus });

    await updateReservationStatus(reservation.id, newStatus);

    const statusMessages = {
      pending: "Reservation set to pending",
      notified: "User has been notified",
      fulfilled: "Reservation fulfilled successfully",
      cancelled: "Reservation cancelled",
    };
    toast.success(statusMessages[newStatus] || "Reservation updated");

    // Refetch to ensure data consistency
    if (refetch) {
      await refetch();
    }

    return true;
  } catch (error) {
    setLocalReservation(originalReservation);

    const errorMessage =
      error.response?.data?.error || `Failed to ${newStatus} reservation`;
    toast.error(errorMessage);

    console.error("Reservation update error:", error);
    return false;
  }
}
export const handleMarkRead = async (
  accessToken,
  notifications,
  setNotifications,
  setNotificationOpen
) => {
  if (!accessToken) {
    console.error("AccessToken missing. Cannot mark read.");
    return;
  }

  const previousState = [...notifications];

  // 1. Optimistic Update: Mark them as read in UI immediately
  setNotifications((prevNotifications) =>
    prevNotifications.map((n) => ({ ...n, is_read: true }))
  );

  try {
    // 2. Call Backend
    await axios.patch(
      `${process.env.NEXT_PUBLIC_API_URL}/notifications/mark-read`,

      // 🟢 ARGUMENT 2: The request body (DATA). Mark-all-read usually doesn't need a body.
      // If your API expects an empty body, pass {} or null.
      {},

      // 🔴 ARGUMENT 3: The configuration object, which MUST contain headers.
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);

    // Revert the optimistic UI update on failure
    setNotifications(previousState);
  } finally {
    // Note: Setting to true here keeps it open after the action.
    setNotificationOpen(true);
  }
};

export async function cancelReservation(params) {
  return updateReservationStatus({
    ...params,
    newStatus: "cancelled",
  });
}

export async function fulfillReservation(params) {
  return updateReservationStatus({
    ...params,
    newStatus: "fulfilled",
  });
}

export async function notifyReservation(params) {
  return updateReservationStatus({
    ...params,
    newStatus: "notified",
  });
}
