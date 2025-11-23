"use client";

import { forwardRef } from "react";
import { ConvertStringToDate } from "../../utils/utils";
const NotificationDropdown = forwardRef(
  (
    {
      isMobile,
      notifications = [],
      loadingNotification,
      notificationError,
      accessToken,
      setNotifications,
      setNotificationOpen,
      handleMarkRead,
    },
    ref
  ) => (
    <div
      ref={ref}
      className={`absolute ${
        isMobile ? "lg:hidden" : "hidden lg:block"
      } right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
        <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
        <button
          onClick={() => {
            handleMarkRead(
              accessToken,
              notifications, // <--- PASS THE DATA HERE
              setNotifications,
              setNotificationOpen
            );
          }}
          className="text-xs text-blue-500 cursor-pointer hover:underline"
        >
          Mark all as read
        </button>
      </div>

      {/* Loading */}
      {loadingNotification && (
        <div className="px-4 py-3 text-center text-sm text-gray-500">
          Loading...
        </div>
      )}

      {/* Error */}
      {notificationError && !loadingNotification && (
        <div className="px-4 py-3 text-center text-sm text-red-500">
          Failed to load notifications
        </div>
      )}

      {/* Notifications List */}
      {!loadingNotification && !notificationError && (
        <ul className="max-h-60 overflow-y-auto">
          {notifications.length === 0 ? (
            <li className="px-4 py-3 text-gray-500 text-sm text-center">
              No notifications
            </li>
          ) : (
            notifications.map((n) => (
              <li
                key={n.id}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition ${
                  n.is_read ? "" : "bg-blue-200"
                }`}
              >
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{n.message}</p>
                  <span className="text-xs text-gray-400">
                    {ConvertStringToDate(n.created_at)}
                  </span>
                </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
);

export default NotificationDropdown;
