// utils/userActions.js
import { toast } from "react-toastify";
import axios from "axios";

export const handleBan = async ({ userId, formData, isAdmin, accessToken, refetch, resetBanID }) => {
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

export const handleUnban = async ({ userId, isAdmin, accessToken, refetch, resetUnBanID }) => {
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
