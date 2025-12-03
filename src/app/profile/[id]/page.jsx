"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LogOut,
  BookOpen,
  Star,
  User,
  StarIcon,
  BookMarked, // New: Total Books Read
  BookOpenCheck, // New: Active Loans
  ListTodo, // New: Current Reserve Count
  CalendarDays, // New: Last Activity
  TrendingUp,
} from "lucide-react";
import {
  Avatar,
  ConvertStringToDate,
  StarRating,
} from "../../../../utils/utils";
import { useAuth } from "@/contexts/authContext";
import { useBookReviews } from "@/hooks/useBookReviews";
import Loader from "@/components/loader";
import {
  handleBan,
  handleUnban,
  handleEditSubmit,
  handleDelete,
  handleProfileImageChange,
} from "../../../../utils/userActions";
import { useForm } from "react-hook-form";
import Options from "@/components/options";
import axios from "axios";
import ProfileImageModal from "@/components/profileImageModal";

export default function Profile() {
  const { id: userID } = useParams();
  const { accessToken, isAdmin, logout, userID: uID } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [editedRating, setEditedRating] = useState(0);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedBio, setEditedBio] = useState("");
  const [userBanID, setUserBanID] = useState(null);
  const [userUnBanID, setUserUnBanID] = useState(null);
  const [openProfileImg, setOpenProfileImg] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const {
    reviewsByUser,
    fetchReviewsByUserID,
    deleteReview,
    setReviewsByUser,
    updateReview,
  } = useBookReviews();

  // Redirect if no access token
  useEffect(() => {
    if (!accessToken) {
      router.push("/");
    }
  }, [accessToken, router]);

  // Fetch user profile with Axios
  useEffect(() => {
    if (!userID || !accessToken) return;
    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/user/profile/${userID}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setProfile(res.data);
      } catch (err) {
        console.error("Profile fetch error:", err.response?.data || err);
        setProfileError(err.response?.data?.error || "Failed to fetch profile");
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

  const startEditingBio = (user) => {
    setEditingUserId(user.id);
    setEditedBio(user.bio || "");
  };

  const cancelEditingBio = () => {
    setEditingUserId(null);
    setEditedBio("");
  };

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

  const handleLogout = () => {
    logout();
    setLogoutDialogOpen(false);
    router.push("/");
  };

  const onBanSubmit = async (formData) => {
    if (!profile?.user?.[0]) return;
    const originalProfile = JSON.parse(JSON.stringify(profile));
    setProfile((prev) => ({
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
    }));
    try {
      await handleBan({
        userId: userBanID,
        formData,
        isAdmin,
        accessToken,
        refetch: async () => {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/users/user/profile/${userID}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          setProfile(res.data);
        },
        resetBanID: () => setUserBanID(null),
      });
    } catch (err) {
      setProfile(originalProfile);
    }
  };

  const onUnbanClick = async (userId) => {
    if (!profile?.user?.[0]) return;
    const originalProfile = JSON.parse(JSON.stringify(profile));
    setProfile((prev) => ({
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
    }));
    try {
      await handleUnban({
        userId,
        isAdmin,
        accessToken,
        refetch: async () => {
          const res = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/users/user/profile/${userID}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          setProfile(res.data);
        },
        resetUnBanID: () => setUserUnBanID(null),
      });
    } catch (err) {
      setProfile(originalProfile);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-lg">
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
  const profileImg = profile?.user[0]?.profile_img;
  const isProfileOwner = uID === userID;

  // --- PLACHOLDER DATA FOR DESIGN ---
  const activityData = [
    {
      icon: <BookMarked size={20} className="text-indigo-500" />,
      label: "Total Books Read",
      value: user.all_borrows_count, // Placeholder
    },
    {
      icon: <ListTodo size={20} className="text-yellow-500" />,
      label: "Books Reserved",
      value: user.books_reserved, // Placeholder
    },
    {
      icon: <Star size={20} className="text-yellow-500" />,
      label: "Total Reviews",
      value: user.total_reviews, // Placeholder
    },
    {
      icon: <CalendarDays size={20} className="text-gray-500" />,
      label: "Last Activity",
      value: ConvertStringToDate(user.last_activity) || "No Activity", // Placeholder
    },
    {
      icon: <BookOpen size={20} className="text-purple-500" />,
      label: "Currently Reading",
      value: user.active_borrows_count || 0, // Placeholder
    },
    {
      icon: <ListTodo size={20} className="text-red-500" />,
      label: "Overdue Books",
      value: user.overdue_books || 0, // Placeholder
    },
    {
      icon: <TrendingUp size={20} className="text-blue-500" />,
      label: "Reading Streak",
      value:
        user.reading_streak === 0
          ? "No streak yet"
          : `${user.reading_streak} days`, // Placeholder
    },
  ];
  // --- END PLACHOLDER DATA ---

  return (
    <div className="w-full max-w-7xl md:pt-36 pt-32 mx-auto p-4 space-y-8 xl:px-20 lg:px-20 px-4">
      {/* --- MERGED HERO CARD: Profile Details + Activity + Bio --- */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 lg:p-8 shadow-xl shadow-indigo-100/50 dark:shadow-none transition-all duration-300">
        {/* SECTION 1: Profile Header and Controls */}
        <div className="flex items-start justify-between">
          <div className="flex md:items-center items-start gap-6 w-full">
            <div
              className={`${
                profileImg ? "" : "p-4 bg-indigo-100"
              } relative rounded-full group`}
            >
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) =>
                  handleProfileImageChange(e, user.id, accessToken, setProfile)
                }
              />
              <Avatar
                onClick={() => {
                  if (profileImg) {
                    setOpenProfileImg(true);
                  } else {
                    fileInputRef.current.click();
                  }
                }}
                name={profile.user_name}
                profileImg={profileImg}
                className="h-20 w-20 xl:h-20 xl:w-20 ring-4 ring-indigo-500/30 cursor-pointer"
              />
              {/* Profile Image Options - Visible only to owner */}
              {isProfileOwner && (
                <div className="absolute top-0 right-0 flex justify-center items-center">
                  <Options
                    type={"profile_img"}
                    data={profileImg}
                    onDelete={async () => {
                      await handleDelete({
                        type: "delete_profile_img",
                        userId: user.id,
                        accessToken,
                        setProfile,
                      });
                    }}
                    onView={() => setOpenProfileImg((prev) => !prev)}
                    onEdit={() => fileInputRef.current.click()}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-between items-center w-full">
              <div>
                {/* Name and Role/Status */}
                <div className="flex md:flex-row flex-col md:items-center gap-2">
                  <h1 className="text-lg md:text-3xl dark:text-gray-100 sm:whitespace-nowrap whitespace-normal font-bold text-gray-900">
                    {profile.user_name}
                  </h1>
                  {user.role === "admin" ? (
                    <span className="px-3 flex items-center py-1 w-fit text-xs font-medium text-white bg-indigo-600 rounded-full">
                      Admin
                      <StarIcon
                        size={14}
                        fill="orange"
                        stroke="orange"
                        className="ml-1"
                      />
                    </span>
                  ) : (
                    <span
                      className={`px-3 py-1 w-fit text-xs font-medium text-white rounded-full ${
                        user.is_banned ? "bg-red-500" : "bg-green-500"
                      }`}
                    >
                      {user.is_banned ? "Banned" : "Member"}
                    </span>
                  )}
                </div>
                {/* Contact and Join Date */}
                <p className="dark:text-gray-300 text-slate-500 text-sm mt-1">
                  Email: {user.email || "N/A"}
                </p>
                <p className="dark:text-gray-300 text-slate-500 text-sm">
                  Phone: {user.phone_number || "N/A"}
                </p>
                <p className="dark:text-gray-300 text-slate-500 text-sm">
                  Joined on {ConvertStringToDate(user.created_at)}
                </p>
                {/* Mobile Logout (Owner Only) */}
                {isProfileOwner && (
                  <button
                    onClick={() => setLogoutDialogOpen(true)}
                    className="flex sm:hidden items-center gap-2 bg-indigo-600 text-sm hover:bg-indigo-700 text-white px-3 py-1.5 rounded-sm font-semibold transition duration-200 mt-2.5"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                )}
              </div>
              {/* Admin Ban/Unban Controls (Admin viewing another user) */}
              {isAdmin && !isProfileOwner && (
                <div className="mt-2 text-right text-lg min-w-[150px]">
                  {user.is_banned && (
                    <>
                      <p className="text-red-500 font-medium">
                        Reason: {user.ban_reason || "No reason provided"}
                      </p>
                      {/* Ban Until Logic... (kept for functionality) */}
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
                              Banned until:{" "}
                              {ConvertStringToDate(user.ban_until)} (
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
                    </>
                  )}
                  {user.is_banned ? (
                    <button
                      onClick={() => setUserUnBanID(user.id)}
                      className="px-4 py-2 mt-3 cursor-pointer bg-green-500 text-white text-md rounded-xl hover:bg-green-600 transition-colors duration-200"
                    >
                      Unban
                    </button>
                  ) : (
                    <button
                      onClick={() => setUserBanID(user.id)}
                      className="px-4 py-2 mt-3 cursor-pointer bg-red-500 text-white text-md rounded-xl hover:bg-red-600 transition-colors duration-200"
                    >
                      Ban
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Desktop Logout (Owner Only) */}
          {isProfileOwner && (
            <button
              onClick={() => setLogoutDialogOpen(true)}
              className="sm:flex hidden items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 font-semibold rounded-lg transition duration-200 ml-4"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
        </div>
        {/* SECTION 3: Bio Section (Integrated) */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-start group mb-3">
            <h2 className="text-xl font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <User size={20} />
              About Me
            </h2>
            {/* Bio Options - ALWAYS VISIBLE (FIXED) */}
            {isProfileOwner && (
              <Options
                type={profile?.user?.[0].bio ? "edit" : "bio"}
                data={!!user.bio}
                onDelete={async () => {
                  await handleDelete({
                    type: "bio",
                    userId: user.id,
                    accessToken,
                    setProfile,
                  });
                }}
                onEdit={() => startEditingBio(user)}
              />
            )}
          </div>
          {editingUserId === user.id ? (
            <div className="mt-2 space-y-3">
              <textarea
                rows={3}
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                className="w-full p-3 dark:text-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-4 focus:ring-indigo-200/50 dark:focus:ring-indigo-600/30 transition-shadow"
                placeholder="Write something about yourself..."
              />
              <div className="flex gap-3">
                <button
                  onClick={cancelEditingBio}
                  className="px-5 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleEditSubmit({
                      userId: user.id,
                      editedBio,
                      setProfile,
                      accessToken,
                      cancelEditing: cancelEditingBio,
                    })
                  }
                  className="px-5 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : user.bio ? (
            <p className="text-gray-700 select-none dark:text-gray-300 text-base leading-relaxed font-medium italic border-l-4 border-indigo-400/50 pl-3">
              {user.bio}
            </p>
          ) : (
            <p className="text-gray-500 select-none text-sm italic font-medium">
              No bio available.{" "}
              {isProfileOwner && "Click the menu above to add one."}
            </p>
          )}
        </div>
        {/* SECTION 3: Activity Metrics (New Dashboard Section) */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <BookOpen size={18} className="text-indigo-600" />
            Activity Dashboard
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {activityData.map((item, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col items-center text-center shadow-sm"
              >
                <div className="mb-2">{item.icon}</div>
                <p className="md:text-lg text-sm font-bold text-gray-900 dark:text-white">
                  {item.value}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Borrowed Books Section (Standardized) */}
      <section>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
          <BookOpen size={20} />
          Borrowed Books History
        </h2>
        {borrowsByUser.length === 0 ? (
          <p className="text-gray-500 text-sm">No borrowed books yet.</p>
        ) : (
          <div className="max-h-[55vh] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {borrowsByUser.map((b, index) => (
              <div
                key={b.id}
                className={`p-4 flex justify-between items-start hover:bg-indigo-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                  index < borrowsByUser.length - 1
                    ? "border-b border-gray-100 dark:border-gray-700"
                    : ""
                }`}
              >
                <span className="font-semibold dark:text-white">
                  {b.book_title}
                </span>
                <div className="text-sm text-gray-500 flex flex-col items-end">
                  <span>
                    Borrowed:{" "}
                    <span className="font-medium">
                      {ConvertStringToDate(b.borrowed_at)}
                    </span>
                  </span>
                  <span className="whitespace-nowrap">
                    Returned:{" "}
                    {b.returned_at === null ? (
                      <span className="text-red-500 font-semibold">
                        NOT RETURNED
                      </span>
                    ) : (
                      <span className="font-medium">
                        {ConvertStringToDate(b.returned_at)}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* My Reviews Section (Standardized) */}
      <section>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-indigo-600 dark:text-indigo-400">
          <Star size={20} />
          My Reviews
        </h2>
        {!reviewsByUser || reviewsByUser.length === 0 ? (
          <p className="text-gray-500 text-sm">
            You haven’t written any reviews yet.
          </p>
        ) : (
          <div className="max-h-[55vh] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            {reviewsByUser.map((r, index) => (
              <div
                key={r.id}
                className={`p-4 flex justify-between items-start group relative ${
                  index < reviewsByUser.length - 1
                    ? "border-b border-gray-100 dark:border-gray-700"
                    : ""
                } hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors`}
              >
                <div
                  onClick={() => router.push(`/book/${r.book_id}`)}
                  className="flex-1 cursor-pointer pr-10"
                >
                  <p className="font-bold hover:text-indigo-600 dark:text-white transition-colors">
                    {r.book_title}
                  </p>
                  <p className="text-sm font-semibold text-yellow-500 flex items-center gap-0.5 mt-0.5">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </p>
                  {editingReviewId === r.id ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 space-y-3"
                    >
                      <textarea
                        rows={3}
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                        className="w-full p-3 dark:text-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:outline-none focus:ring-4 focus:ring-indigo-200/50 dark:focus:ring-indigo-600/30 transition-shadow"
                        placeholder="Edit your review comment..."
                      />
                      <StarRating
                        rating={editedRating}
                        setRating={setEditedRating}
                      />
                      <div className="flex gap-3 mt-2">
                        <button
                          onClick={cancelEditing}
                          className="px-5 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() =>
                            handleEditSubmit({
                              reviewId: r.id,
                              editedComment,
                              editedRating,
                              reviewsByUser,
                              setReviewsByUser,
                              updateReview,
                              cancelEditing,
                            })
                          }
                          className="text-white px-5 py-2 bg-indigo-500 rounded-xl hover:bg-indigo-600 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm mt-2 dark:text-gray-300">
                      {r.comment}
                    </p>
                  )}
                </div>
                {/* Review Options (FIXED: Visible on mobile, hover on medium+) */}
                {isProfileOwner && (
                  <div className="absolute top-4 right-4 opacity-100 md:opacity-0 group-hover:md:opacity-100 transition-opacity duration-200">
                    <Options
                      type="edit"
                      data={!!r.comment || !!r.rating}
                      onDelete={async () => await deleteReview(r.id)}
                      onEdit={() => startEditing(r)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- Modals (Ban, Unban, Logout, Profile Image) --- */}
      {/* Logout Dialog */}
      {logoutDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-96 shadow-2xl text-center transition-all duration-300">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Confirm Logout
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Yes, Log Out
              </button>
              <button
                onClick={() => setLogoutDialogOpen(false)}
                className="px-5 py-2 bg-gray-300 rounded-xl dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unban Dialog */}
      {userUnBanID && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl p-8 w-96 dark:bg-gray-800 shadow-2xl text-center transition-all duration-300">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Confirm Unban
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to unban this user?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => onUnbanClick(userUnBanID)}
                className="px-5 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                Yes, Unban
              </button>
              <button
                onClick={() => setUserUnBanID(null)}
                className="px-5 py-2 bg-gray-300 rounded-xl dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Dialog */}
      {userBanID && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <form
            onSubmit={handleSubmit(onBanSubmit)}
            className="bg-white rounded-2xl p-8 w-96 shadow-2xl text-center dark:bg-gray-800 transition-all duration-300"
          >
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Confirm Ban
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Provide details for banning this user.
            </p>
            <div className="mb-4 text-left">
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                Ban Reason
              </label>
              <input
                type="text"
                {...register("ban_reason", {
                  required: "Reason is required",
                  minLength: { value: 3, message: "Reason too short" },
                })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white dark:bg-gray-900"
                placeholder="Enter reason..."
              />
              {errors.ban_reason && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.ban_reason.message}
                </p>
              )}
            </div>
            <div className="mb-6 text-left">
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                Ban Until (leave empty for permanent ban)
              </label>
              <input
                type="date"
                {...register("ban_until")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white dark:bg-gray-900"
              />
            </div>
            <div className="flex justify-center gap-4">
              <button
                type="submit"
                className="px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200"
              >
                Confirm Ban
              </button>
              <button
                type="button"
                onClick={() => setUserBanID(null)}
                className="px-5 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <ProfileImageModal
        imageSrc={profileImg}
        openProfileImg={openProfileImg}
        setOpenProfileImg={setOpenProfileImg}
      />
    </div>
  );
}
