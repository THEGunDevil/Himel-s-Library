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
  reviewId,
  isAdmin,
  accessToken,
  setProfile,
  reviewsByUser,
  setReviewsByUser,
  deleteReview,
}) => {
  let originalReviews; // for rollback if review deletion fails

  try {
    if (type === "bio") {
      if (!userId) return;
      if (!isAdmin || !accessToken) {
        toast.error("You are not authorized to delete bios.");
        return;
      }

      // Call API first
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/user/${userId}`,
        { bio: null },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      // Update local state after successful API call
      if (setProfile) {
        setProfile((prev) => {
          const userData = Array.isArray(prev.user)
            ? prev.user.map((u) => (u.id === userId ? { ...u, bio: null } : u))
            : prev.user.id === userId
            ? { ...prev.user, bio: null }
            : prev.user;

          return { ...prev, user: userData };
        });
      }

      toast.success("Bio deleted successfully!");
    } else if (type === "review") {
      if (!reviewId || !reviewsByUser || !setReviewsByUser || !deleteReview)
        return;

      // Backup original reviews for rollback
      originalReviews = [...reviewsByUser];

      // Optimistic UI update
      setReviewsByUser((prev) => prev.filter((r) => r.id !== reviewId));

      // Delete review via API
      await deleteReview(reviewId);

      toast.success("Review deleted successfully!");
    } else {
      throw new Error("Invalid type for deletion");
    }
  } catch (err) {
    console.error("Delete error:", err.response?.data || err);
    toast.error("Failed to delete.");

    // Rollback UI for review deletion
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
