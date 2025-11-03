"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LogOut, BookOpen, Star } from "lucide-react";
import { Avatar, ConvertStringToDate, StarRating } from "@/utils";
import { toast } from "react-toastify";
import ReviewOptions from "@/components/dropDownMenu";
import { useAuth } from "@/contexts/authContext";
import { useBookReviews } from "@/hooks/useBookReviews";
import Loader from "@/components/loader";

export default function Profile() {
  const { id: userID } = useParams();
  const { accessToken, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const router = useRouter();
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [editedRating, setEditedRating] = useState(0);

  const {
    reviewsByUser,
    fetchReviewsByUserID,
    deleteReview,
    updateReview,
    setReviewsByUser, // We will need this to update state directly
  } = useBookReviews();

  useEffect(() => {
    if (!accessToken) router.push("/auth/log-in");
  }, [accessToken]);

  useEffect(() => {
    if (!userID || !accessToken) return;

    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/user/profile/${userID}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const data = await res.json();
        setProfile(data);

        // Fetch reviews by user
        fetchReviewsByUserID(userID);
      } catch (err) {
        console.error(err);
        setProfileError(err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [userID, accessToken]);

  const startEditing = (review) => {
    setEditingReviewId(review.id);
    setEditedComment(review.comment);
    setEditedRating(review.rating);
  };

  const cancelEditing = () => setEditingReviewId(null);

  // Handle instant UI update after editing
  const handleEditSubmit = async (reviewId) => {
    try {
      const updatedReview = {
        ...reviewsByUser.find((r) => r.id === reviewId),
        comment: editedComment,
        rating: editedRating,
      };

      // Optimistically update UI
      setReviewsByUser((prev) =>
        prev.map((r) => (r.id === reviewId ? updatedReview : r))
      );

      await updateReview(reviewId, {
        comment: editedComment,
        rating: editedRating,
      });

      toast.success("Review updated ✅");
      cancelEditing();
    } catch (err) {
      toast.error("Failed to update review ❌");
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await deleteReview(reviewId);
      // Remove review immediately from UI
      setReviewsByUser((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Review deleted ✅");
    } catch (err) {
      toast.error("Failed to delete review ❌");
    }
  };

  const handleLogout = () => {
    logout();
    setLogoutDialogOpen(false);
    router.push("/");
  };

  if (profileLoading)
    return (
      <div className="mt-40">
        <Loader />
      </div>
    );

  if (profileError)
    return (
      <p className="text-center sm:mt-40 mt-30 text-red-500">Failed to load profile.</p>
    );

  if (!profile) return null;

  const user = profile.user[0];
  const borrowsByUser = profile.borrows || [];

  return (
    <>
      <div className="w-full md:pt-36 pt-32 mx-auto p-6 space-y-6 xl:px-60 lg:px-30 px-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Avatar name={profile.user_name} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">{profile.user_name}</h1>
              <p className="text-gray-400 text-xs">
                Joined on {ConvertStringToDate(user.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setLogoutDialogOpen(true)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white sm:px-4 px-2  py-2 transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Borrowed Books */}
        <section>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <BookOpen size={18} /> Borrowed Books
          </h2>
          {borrowsByUser.length === 0 ? (
            <p className="text-gray-500 text-sm">No borrowed books yet.</p>
          ) : (
            <div className="divide-y divide-gray-200 bg-gray-50 rounded-lg shadow-sm">
              {borrowsByUser.map((b) => (
                <div
                  key={b.id}
                  className="p-3 flex justify-between items-center"
                >
                  <span>{b.book_title}</span>
                  <div className="text-sm text-gray-500 flex flex-col">
                    <span>Borrowed: {ConvertStringToDate(b.borrowed_at)}</span>
                    <span>
                      Returned:{" "}
                      {b.returned_at === null
                        ? "NOT RETURNED"
                        : ConvertStringToDate(b.returned_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reviews */}
        <section>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Star size={18} /> My Reviews
          </h2>
          {!reviewsByUser || reviewsByUser?.length === 0 ? (
            <p className="text-gray-500 text-sm">
              You haven’t written any reviews yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-200 bg-gray-50 rounded-lg shadow-sm">
              {reviewsByUser?.map((r) => (
                <div
                  key={r.id}
                  className="p-3 flex justify-between items-start group relative"
                >
                  <div className="flex-1">
                    <p className="font-medium">{r.book_title}</p>
                    <p className="text-sm text-yellow-500">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </p>

                    {editingReviewId === r.id ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          rows={3}
                          value={editedComment}
                          onChange={(e) => setEditedComment(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                        />
                        <StarRating
                          rating={editedRating}
                          setRating={setEditedRating}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={cancelEditing}
                            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleEditSubmit(r.id)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm mt-1">{r.comment}</p>
                    )}
                  </div>

                  <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                    <ReviewOptions
                      onDelete={() => handleDelete(r.id)}
                      onEdit={() => startEditing(r)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Logout dialog */}
      {logoutDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg text-center">
            <h2 className="text-lg font-bold mb-4">Confirm Logout</h2>
            <p className="mb-6">Are you sure you want to log out?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Log Out
              </button>
              <button
                onClick={() => setLogoutDialogOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
