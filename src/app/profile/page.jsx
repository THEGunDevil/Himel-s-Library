"use client";

import { useAuth } from "@/contexts/authContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, BookOpen, Star } from "lucide-react";
import { jwtDecode } from "jwt-decode"; // ✅ fixed import
import { Avatar, ConvertStringToDate } from "@/utils";
import axios from "axios";

export default function Profile() {
  const { token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const router = useRouter();
  useEffect(() => {
    if (!token) router.push("/auth/log-in");
  }, [token]);

  // Decode token to get userId
  const decoded = token && typeof token === "string" ? jwtDecode(token) : null;
  const userId = decoded?.sub;

  useEffect(() => {
    if (!userId) return;
    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/users/user/profile/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProfile(response.data);
      } catch (err) {
        console.error("❌ Failed to fetch borrows:", err);
        setProfileError(err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (profileLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 animate-pulse">Loading profile...</p>
      </div>
    );

  if (profileError)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">Failed to load profile data.</p>
      </div>
    );

  if (!profile) return null; // safety
  const user = profile?.user[0];
  const borrowsByUser = profile?.borrows || [];
  const reviewsByUser = profile?.reviews || [];
  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setLogoutDialogOpen(false);
    router.push("/");
  };
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
              <h1 className="text-2xl font-semibold">{profile.user_name} </h1>
              <p className="text-gray-400 text-xs">
                Joined on {ConvertStringToDate(user.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-400 cursor-pointer text-white px-4 py-2 rounded-lg transition"
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
                <div key={b.id} className="p-3 flex justify-between">
                  <span>{b.book_title}</span>
                  <span className="text-sm text-gray-500">
                    Borrowed: {ConvertStringToDate(b.borrowed_at)}
                  </span>
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
          {reviewsByUser.length === 0 ? (
            <p className="text-gray-500 text-sm">
              You haven’t written any reviews yet.
            </p>
          ) : (
            <div className="divide-y divide-gray-200 bg-gray-50 rounded-lg shadow-sm">
              {reviewsByUser.map((r) => (
                <div key={r.id} className="p-3">
                  <p className="font-medium">{r.book_title}</p>
                  <p className="text-sm text-yellow-500">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      {logoutDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg text-center">
            <h2 className="text-lg font-bold mb-4">Confirm Logout</h2>
            <p className="mb-6">Are you sure you want to log out?</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={confirmLogout}
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
