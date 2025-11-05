"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { LogOut, BookOpen, Star, User } from "lucide-react";
import {
  Avatar,
  ConvertStringToDate,
  StarRating,
} from "../../../../utlis/utils";
import { toast } from "react-toastify";
import ReviewOptions from "@/components/dropDownMenu";
import { useAuth } from "@/contexts/authContext";
import { useBookReviews } from "@/hooks/useBookReviews";
import Loader from "@/components/loader";
import { handleBan, handleUnban } from "../../../../utlis/userActions";
import { useForm } from "react-hook-form";

export default function Profile() {
  const { id: userID } = useParams();
  const { accessToken, isAdmin, logout, userID: uID } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [editedRating, setEditedRating] = useState(0);
  const [userBanID, setUserBanID] = useState(null);
  const [userUnBanID, setUserUnBanID] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const {
    reviewsByUser,
    fetchReviewsByUserID,
    deleteReview,
    updateReview,
    setReviewsByUser,
  } = useBookReviews();

  // Redirect if no access token
  useEffect(() => {
    if (!accessToken) {
      router.push("/auth/log-in");
    }
  }, [accessToken, router]);

  // Fetch user profile
  useEffect(() => {
    if (!userID || !accessToken) return;

    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/user/profile/${userID}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Profile fetch error:", err);
        setProfileError(err.message);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [userID, accessToken]);

  // Fetch reviews separately
  useEffect(() => {
    if (!userID || !accessToken) return;
    fetchReviewsByUserID(userID);
  }, [userID, accessToken, fetchReviewsByUserID]);

  // Review editing handlers
  const startEditing = (review) => {
    setEditingReviewId(review.id);
    setEditedComment(review.comment);
    setEditedRating(review.rating);
  };

  const cancelEditing = () => {
    setEditingReviewId(null);
    setEditedComment("");
    setEditedRating(0);
  };

  const handleEditSubmit = async (reviewId) => {
    try {
      const updatedReview = {
        ...reviewsByUser.find((r) => r.id === reviewId),
        comment: editedComment,
        rating: editedRating,
      };

      // Optimistic UI update
      setReviewsByUser((prev) =>
        prev.map((r) => (r.id === reviewId ? updatedReview : r))
      );

      await updateReview(reviewId, {
        comment: editedComment,
        rating: editedRating,
      });
      toast.success("Review updated ✅");
      cancelEditing();
    } catch {
      toast.error("Failed to update review ❌");
      setReviewsByUser([...reviewsByUser]);
    }
  };

  const handleDelete = async (reviewId) => {
    const originalReviews = [...reviewsByUser];

    try {
      setReviewsByUser((prev) => prev.filter((r) => r.id !== reviewId));

      await deleteReview(reviewId);

      toast.success("Review deleted ✅");
    } catch (err) {
      console.error("Delete review error:", err);
      setReviewsByUser(originalReviews);
      toast.error("Failed to delete review ❌");
    }
  };

  const handleLogout = () => {
    logout();
    setLogoutDialogOpen(false);
    router.push("/");
  };

  const onBanSubmit = async (formData) => {
    if (!profile?.user?.[0]) return;

    const originalProfile = JSON.parse(JSON.stringify(profile));

    setProfile((prev) => {
      if (!prev?.user?.[0]) return prev;
      return {
        ...prev,
        user: [
          {
            ...prev.user[0],
            is_banned: true,
            ban_reason: formData.ban_reason,
            ban_until: formData.ban_until || null,
            is_permanent_ban: !formData.ban_until,
          },
        ],
      };
    });

    setUserBanID(null)

    try {
      await handleBan({
        userId: userBanID,
        formData,
        isAdmin,
        accessToken,
      });
      toast.success("User banned successfully ✅");
    } catch (err) {
      console.error("Ban error:", err);
      setProfile(originalProfile);
      toast.error("Failed to ban user ❌");
    }
  };

  const onUnbanClick = async (userId) => {
    if (!profile?.user?.[0]) return;

    const originalProfile = JSON.parse(JSON.stringify(profile));

    setProfile((prev) => {
      if (!prev?.user?.[0]) return prev;
      return {
        ...prev,
        user: [
          {
            ...prev.user[0],
            is_banned: false,
            ban_reason: null,
            ban_until: null,
            is_permanent_ban: false,
          },
        ],
      };
    });

    setUserUnBanID(null);

    try {
      await handleUnban({
        userId,
        isAdmin,
        accessToken,
      });
    } catch (err) {
      console.error("Unban error:", err);
      setProfile(originalProfile);
    }
  };

  if (profileLoading) {
    return (
      <div className="mt-40">
        <Loader />
      </div>
    );
  }

  if (profileError) {
    return (
      <p className="text-center sm:mt-40 mt-30 text-red-500">
        Failed to load profile: {profileError}
      </p>
    );
  }

  if (!profile || !profile.user?.[0]) return null;

  const user = profile.user[0];
  const borrowsByUser = profile.borrows || [];

  return (
    <>
      <div className="w-full md:pt-36 pt-32 mx-auto p-6 space-y-6 xl:px-60 lg:px-30 px-4">
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 w-full">
              <div className="p-4 bg-indigo-100 rounded-full">
                <Avatar name={profile.user_name} className="h-12 w-12" />
              </div>

              <div className="flex justify-between items-center w-full">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold text-gray-800">
                      {profile.user_name}
                    </h1>

                    {user.role === "admin" ? (
                      <span className="px-2 py-1 text-xs font-medium text-white bg-indigo-600 rounded-full">
                        Admin
                      </span>
                    ) : (
                      <span
                        className={`px-2 py-1 text-xs font-medium text-white rounded-full ${
                          user.is_banned ? "bg-red-500" : "bg-green-500"
                        }`}
                      >
                        {user.is_banned ? "Banned" : "Member"}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm mt-1">
                      Email: {user.email || "N/A"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Phone: {user.phone_number || "N/A"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Joined on {ConvertStringToDate(user.created_at)}
                    </p>
                  </div>
                </div>

                {isAdmin && uID !== userID && (
                  <div className="mt-2 text-right text-lg">
                    {user.is_banned && (
                      <p className="text-red-500 font-medium">
                        Reason: {user.ban_reason || "No reason provided"}
                      </p>
                    )}
                    {user.is_permanent_ban ? (
                      <p className="text-red-500 text-sm">Permanent Ban</p>
                    ) : user.ban_until &&
                      user.ban_until !== "0001-01-01T00:00:00Z" ? (
                      (() => {
                        const banEnd = new Date(user.ban_until);
                        const now = new Date();
                        const daysLeft = Math.ceil(
                          (banEnd - now) / (1000 * 60 * 60 * 24)
                        );
                        return (
                          <p className="text-red-500 text-sm">
                            Banned until: {ConvertStringToDate(user.ban_until)}{" "}
                            (
                            {daysLeft > 0
                              ? `${daysLeft} day${
                                  daysLeft === 1 ? "" : "s"
                                } remaining`
                              : "Expired"}
                            )
                          </p>
                        );
                      })()
                    ) : null}
                    {user.is_banned ? (
                      <button
                        onClick={() => setUserUnBanID(user.id)}
                        className="px-3 py-1 mt-3 cursor-pointer bg-green-500 text-white text-md rounded hover:bg-green-600 transition-colors duration-200"
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => setUserBanID(user.id)}
                        className="px-3 py-1 mt-3 cursor-pointer bg-red-500 text-white text-md rounded hover:bg-red-600 transition-colors duration-200"
                      >
                        Ban
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {uID === userID && (
              <button
                onClick={() => setLogoutDialogOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition duration-200"
              >
                <LogOut size={18} /> Logout
              </button>
            )}
          </div>
        </div>

        <section className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <User size={18} /> Bio
          </h2>
          {user.bio ? (
            <p className="text-gray-700 text-sm leading-relaxed">{user.bio}</p>
          ) : (
            <p className="text-gray-500 text-sm italic">
              No bio available. Add a short introduction about yourself!
            </p>
          )}
        </section>

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

        <section>
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Star size={18} /> My Reviews
          </h2>

          {!reviewsByUser || reviewsByUser.length === 0 ? (
            <p className="text-gray-500 text-sm">
              You haven’t written any reviews yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-200 bg-gray-50 rounded-lg shadow-sm">
              {reviewsByUser.map((r) => (
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

      {/* Logout Dialog */}
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

      {userUnBanID && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg text-center">
            <h2 className="text-lg font-bold mb-4">Confirm Unban</h2>
            <p className="mb-6">Are you sure you want to unban this user?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => onUnbanClick(userUnBanID)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Yes, Unban
              </button>
              <button
                onClick={() => setUserUnBanID(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {userBanID && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <form
            onSubmit={handleSubmit(onBanSubmit)}
            className="bg-white rounded-lg p-6 w-80 shadow-lg text-center"
          >
            <h2 className="text-lg font-bold mb-4">Confirm Ban</h2>
            <p className="mb-4 text-gray-700">
              Provide details for banning this user.
            </p>

            <div className="mb-4 text-left">
              <label className="block text-sm font-medium mb-1">
                Ban Reason
              </label>
              <input
                type="text"
                {...register("ban_reason", {
                  required: "Reason is required",
                  minLength: { value: 3, message: "Reason too short" },
                })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter reason..."
              />
              {errors.ban_reason && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.ban_reason.message}
                </p>
              )}
            </div>

            <div className="mb-6 text-left">
              <label className="block text-sm font-medium mb-1">
                Ban Until (leave empty for permanent ban)
              </label>
              <input
                type="date"
                {...register("ban_until")}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-center gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
              >
                Confirm Ban
              </button>
              <button
                type="button"
                onClick={() => setUserBanID(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
