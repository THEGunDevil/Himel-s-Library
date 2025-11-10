"use client";
import Link from "next/link";
import Logo from "./logo";
import { usePathname } from "next/navigation";
import { BellIcon, Search, SidebarIcon, X } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/authContext";
import SearchBar from "./searchBar";
import { toast } from "react-toastify";
import axios from "axios";

export default function Header() {
  const { accessToken, logout, isAdmin, userID } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotification, setLoadingNotification] = useState(false);
  const [notificationError, setNotificationError] = useState(null);
  const sidebarRef = useRef(null);
  const toggleRef = useRef(null);
  const searchRef = useRef(null);
  const searchBtnRef = useRef(null);

  const pathname = usePathname();
  const navigation = [
    { title: "Home", path: "/" },
    { title: "About us", path: "/about" },
    { title: "Contact us", path: "/contact" },
    ...(accessToken ? [{ title: "Profile", path: `/profile/${userID}` }] : []),
    ...(isAdmin
      ? [{ title: "Dashboard", path: "/dashboard", hiddenOnMobile: true }]
      : []),
    ...(!accessToken
      ? [
          { title: "Log In", path: "/auth/log-in" },
          { title: "Sign Up", path: "/auth/sign-up" },
        ]
      : []),
  ];

  // ✅ Toggle search dropdown (mutually exclusive with sidebar)
  const handleSearchDropDown = () => {
    setOpen((prev) => {
      const newState = !prev;
      if (newState) setSidebarOpen(false);
      return newState;
    });
  };

  // ✅ Toggle sidebar (mutually exclusive with search dropdown)
  const handleSidebarToggle = () => {
    setSidebarOpen((prev) => {
      const newState = !prev;
      if (newState) setOpen(false);
      return newState;
    });
  };

  // ✅ Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        toggleRef.current &&
        !toggleRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  // ✅ Close search bar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        open &&
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        searchBtnRef.current &&
        !searchBtnRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // ✅ Close sidebar or search when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchNotificationsByUserID = useCallback(async () => {
    if (!accessToken) return;

    setLoadingNotification(true);
    setNotificationError(null);
    try {
      const response = axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/get`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setNotifications(response.data);
    } catch (err) {
      console.error("❌ Failed to fetch notifications:", err);
      setNotificationError(err);
    } finally {
      setLoadingNotification(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchNotificationsByUserID(); // ✅ just call it, no argument
  }, [fetchNotificationsByUserID]);

  const handleLogoutClick = () => setLogoutDialogOpen(true);

  const confirmLogout = async () => {
    try {
      await logout(); // Wait for logout to complete
      setLogoutDialogOpen(false);
      toast.success("Log out successful");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    }
  };
  console.log(notifications);

  return (
    <>
      <header className="w-full fixed top-0 z-50 bg-blue-200 border-b border-blue-300 flex items-center justify-between px-4 lg:px-30 xl:px-60 h-20 md:h-32">
        {/* Logo */}
        <Link href="/" className="hidden md:flex items-center">
          <Logo width={112} />
        </Link>
        <Link href="/" className="flex md:hidden items-center">
          <Logo width={70} />
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex gap-8 ml-10 uppercase font-medium text-gray-700">
          {navigation.map((nav) => (
            <li key={nav.path}>
              <Link
                href={nav.path}
                className={`hover:text-blue-400 ${
                  pathname === nav.path ? "text-blue-400 font-bold" : ""
                }`}
              >
                {nav.title}
              </Link>
            </li>
          ))}
        </ul>

        {/* Sidebar (Mobile) */}
        <nav
          ref={sidebarRef}
          className={`fixed lg:hidden top-0 left-0 h-screen w-64 md:p-8 p-4 bg-blue-200 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div
            onClick={() => setSidebarOpen(false)}
            className="absolute text-blue-600 right-5 top-5 cursor-pointer"
          >
            <X size={28} />
          </div>

          <div>
            <Logo width={82} />
          </div>

          <ul className="flex flex-col gap-6 uppercase font-medium text-lg mt-8 sm:mt-10">
            {navigation.map((nav) => (
              <li
                key={nav.path}
                className={nav.hiddenOnMobile ? "hidden sm:block" : ""}
                onClick={() => setSidebarOpen(false)}
              >
                {nav.title === "Log Out" ? (
                  <button
                    onClick={handleLogoutClick}
                    className="hover:text-blue-400 text-gray-700 uppercase font-medium"
                  >
                    Log Out
                  </button>
                ) : (
                  <Link
                    href={nav.path}
                    className={`hover:text-blue-400 ${
                      pathname === nav.path
                        ? "text-blue-400 font-bold"
                        : "text-gray-700"
                    }`}
                  >
                    {nav.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Search & Sidebar Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="relative inline-block">
            <button
              onClick={() => setNotificationOpen((prev) => !prev)}
              className="p-2 hidden md:block cursor-pointer
                   hover:bg-blue-50 active:scale-95 rounded-full transition-all duration-200"
            >
              <BellIcon className="text-blue-400 w-7 h-7" />
            </button>

            {/* Notification badge */}
            {notifications?.length > 0 && (
              <span
                className="absolute hidden md:block -top-1 -right-1 bg-red-500 text-white text-xs
                     font-bold rounded-full px-1.5 py-0.5 shadow-sm"
              >
                {notifications?.length > 9 ? "9+" : notifications?.length}
              </span>
            )}
            {notificationOpen && (
              <div className="absolute hidden md:block right-0 mt-2 w-72 bg-white border border-gray-200 z-50 overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Notifications
                  </h3>
                  <button
                    onClick={() => {
                      setNotifications(0);
                      setNotificationOpen(false);
                    }}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    Mark all as read
                  </button>
                </div>

                <ul className="max-h-60 overflow-y-auto hidden md:block">
                  {notifications?.length === 0 ? (
                    <li className="px-4 py-3 text-gray-500 text-sm text-center">
                      No notifications
                    </li>
                  ) : (
                    notifications?.map((n) => (
                      <li
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition"
                      >
                        {n.icon}
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{n.text}</p>
                          <span className="text-xs text-gray-400">
                            {n.time}
                          </span>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>
          <button
            ref={searchBtnRef}
            onClick={handleSearchDropDown}
            className="hidden md:block p-2 bg-white rounded-full"
          >
            <Search className="text-blue-400" />
          </button>

          <div ref={searchRef}>
            <SearchBar open={open} />
          </div>

          <div ref={toggleRef} className="flex md:hidden items-center gap-1">
            <div className="relative inline-block">
              <button
                onClick={() => setNotificationOpen((prev) => !prev)}
                className="p-2 md:hidden block cursor-pointer rounded-full
                   hover:bg-blue-50 active:scale-95 transition-all duration-200"
              >
                <BellIcon className="text-blue-400 w-7 h-7" />
              </button>

              {/* Notification badge */}
              {notifications?.length > 0 && (
                <span
                  className="absolute md:hidden block -top-1 -right-1 bg-red-500 text-white text-xs
                     font-bold rounded-full px-1.5 py-0.5 shadow-sm"
                >
                  {notifications?.length > 9 ? "9+" : notifications?.length}
                </span>
              )}
              {notificationOpen && (
                <div className="absolute md:hidden block right-0 mt-2 w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Notifications
                    </h3>
                    <button
                      onClick={() => {
                        setNotifications(0);
                        setNotificationOpen(false);
                      }}
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <ul className="max-h-60 overflow-y-auto md:hidden block">
                    {notifications?.length === 0 ? (
                      <li className="px-4 py-3 text-gray-500 text-sm text-center">
                        No notifications
                      </li>
                    ) : (
                      notifications?.map((n) => (
                        <li
                          key={n.id}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-blue-50 cursor-pointer transition"
                        >
                          {n.icon}
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">{n.text}</p>
                            <span className="text-xs text-gray-400">
                              {n.time}
                            </span>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
            <button
              ref={searchBtnRef}
              onClick={handleSearchDropDown}
              className="p-2 bg-white rounded-full"
            >
              <Search className="text-blue-400" />
            </button>
            <button onClick={handleSidebarToggle}>
              <SidebarIcon className="h-7 w-7 text-blue-400 cursor-pointer" />
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
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
