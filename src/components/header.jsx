"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Logo from "./logo";
import { usePathname } from "next/navigation";
import {
  BellIcon,
  Home,
  InfoIcon,
  LayoutDashboard,
  LogIn,
  Menu,
  PhoneCall,
  Search,
  UserPlus2,
  UserSquareIcon,
} from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/authContext";
import SearchBar from "./searchBar";
import { toast } from "react-toastify";
import axios from "axios";
import { handleMarkRead } from "../../utils/userActions";
import NotificationDropdown from "./notificationDropDown";
import MobileSidebar from "./mobileSideBar";

export default function Header() {
  const { accessToken, logout, isAdmin, userID } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotification, setLoadingNotification] = useState(false);
  const [notificationError, setNotificationError] = useState(null);
  const sidebarRef = useRef(null);
  const sidebarBtnRef = useRef(null);
  const searchRef = useRef(null);
  const searchBtnDesktopRef = useRef(null);
  const bellBtnDesktopRef = useRef(null);
  const searchBtnMobileRef = useRef(null);
  const bellBtnMobileRef = useRef(null);
  const notificationMobileRef = useRef(null); // Separate ref for mobile
  const notificationDesktopRef = useRef(null); // Separate ref for desktop
  const navigation = [
    { title: "Home", path: "/", icon: <Home size={17} /> },
    { title: "About us", path: "/about", icon: <InfoIcon size={17} /> },
    { title: "Contact us", path: "/contact", icon: <PhoneCall size={17} /> },
    ...(accessToken
      ? [
          {
            title: "Profile",
            path: `/profile/${userID}`,
            icon: <UserSquareIcon size={17} />,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            title: "Dashboard",
            path: "/dashboard",
            icon: <LayoutDashboard size={17} />, // close the component properly
            hiddenOnMobile: true, // boolean, not string
          },
        ]
      : []),

    ...(!accessToken
      ? [
          { title: "Log In", path: "/auth/log-in", icon: <LogIn size={17} /> },
          {
            title: "Sign Up",
            path: "/auth/sign-up",
            icon: <UserPlus2 size={17} />,
          },
        ]
      : []),
  ];

  const handleSearchToggle = () => {
    setSearchOpen((prev) => {
      const newState = !prev;
      if (newState) setSidebarOpen(false);
      return newState;
    });
  };

  const handleSidebarToggle = () => {
    setSidebarOpen((prev) => {
      const newState = !prev;
      if (newState) setSearchOpen(false);
      return newState;
    });
  };

  const fetchNotificationsByUserID = useCallback(async () => {
    if (!accessToken) return;
    setLoadingNotification(true);
    setNotificationError(null);

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/get`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const allData = Array.isArray(response.data) ? response.data : [];

      // ✅ FIX: Only keep items where is_read is FALSE
      // const unreadOnly = allData.filter((n) => n.is_read === false);

      setNotifications(allData);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setNotificationError(err);
    } finally {
      setLoadingNotification(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchNotificationsByUserID();
  }, [fetchNotificationsByUserID]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Sidebar
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        sidebarBtnRef.current &&
        !sidebarBtnRef.current.contains(e.target)
      ) {
        setSidebarOpen(false);
      }

      // Search
      if (
        searchOpen &&
        searchRef.current &&
        !searchRef.current.contains(e.target) &&
        !searchBtnDesktopRef.current?.contains(e.target) &&
        !searchBtnMobileRef.current?.contains(e.target)
      ) {
        setSearchOpen(false);
      }

      // Notification
      if (
        notificationOpen &&
        !bellBtnDesktopRef.current?.contains(e.target) &&
        !bellBtnMobileRef.current?.contains(e.target) &&
        !notificationMobileRef.current?.contains(e.target) &&
        !notificationDesktopRef.current?.contains(e.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside, true);
  }, [sidebarOpen, searchOpen, notificationOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const confirmLogout = async () => {
    try {
      await logout();
      setLogoutDialogOpen(false);
      toast.success("Logged out successfully");
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Logout failed. Please try again.");
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  return (
    <>
      <header className="w-full fixed top-0 z-50 bg-blue-200 border-b border-blue-300 flex items-center justify-between px-4 lg:px-20 h-20 sm:h-28">
        {/* Logo */}
        <Link href="/" className="flex items-center md:hidden">
          <Logo width={70} />
        </Link>
        <Link href="/" className="hidden md:flex items-center">
          <Logo width={100} />
        </Link>

        {/* Desktop Navigation */}
        <nav>
          <ul className="hidden lg:flex gap-8 lg:gap-5 uppercase font-medium text-gray-700">
            {navigation.map((nav) => (
              <li key={nav.path}>
                <Link
                  href={nav.path}
                  className={`hover:text-blue-400 flex items-center whitespace-nowrap gap-0.5 ${
                    pathname === nav.path ? "text-blue-400 font-bold" : ""
                  }`}
                >
                  <span>{nav.icon}</span>
                  <span>{nav.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar (Mobile) */}
        <nav
          ref={sidebarRef}
          className={`fixed lg:hidden top-0 left-0 h-screen md:w-80 border-r-8 border-blue-400 w-64 p-4 bg-blue-200 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Sidebar (Mobile) */}
          <MobileSidebar
            navigation={navigation}
            pathname={pathname}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isAdmin={isAdmin}
            accessToken={accessToken}
          />
        </nav>

        {/* Search & Notification */}
        <div className="flex items-center gap-2.5">
          {/* Search Buttons */}
          <button
            ref={searchBtnDesktopRef}
            onClick={handleSearchToggle}
            className="hidden lg:block p-2 bg-white rounded-full"
          >
            <Search className="text-blue-400" />
          </button>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-2.5">
            {/* Mobile Search Button */}
            <button
              ref={searchBtnMobileRef}
              onClick={handleSearchToggle}
              className="p-2 bg-white rounded-full"
            >
              <Search size={20} className="text-blue-400" />
            </button>

            {/* Mobile Notification */}
            <div className="relative">
              <button
                ref={bellBtnMobileRef}
                onClick={() => setNotificationOpen((prev) => !prev)}
                className="p-2 bg-white rounded-full"
              >
                <BellIcon size={20} className="text-blue-400" />
              </button>

              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}

              {notificationOpen && (
                <NotificationDropdown
                  ref={notificationMobileRef}
                  isMobile={true}
                  notifications={notifications}
                  loadingNotification={loadingNotification}
                  notificationError={notificationError}
                  accessToken={accessToken}
                  setNotifications={setNotifications}
                  setNotificationOpen={setNotificationOpen}
                  handleMarkRead={handleMarkRead}
                />
              )}
            </div>

            {/* Sidebar Toggle Button */}
            <button ref={sidebarBtnRef} onClick={handleSidebarToggle}>
              <Menu size={23} className="text-blue-400" />
            </button>
          </div>

          {/* Desktop Notification */}
          <div className="relative hidden lg:block ml-2">
            <button
              onClick={() => setNotificationOpen((prev) => !prev)}
              ref={bellBtnDesktopRef}
              className="p-2 cursor-pointer rounded-full hover:bg-blue-50 transition duration-200"
            >
              <BellIcon className="text-blue-400 w-7 h-7" />
            </button>

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}

            {notificationOpen && (
              <NotificationDropdown
                ref={notificationDesktopRef}
                isMobile={false}
                notifications={notifications}
                loadingNotification={loadingNotification}
                notificationError={notificationError}
                accessToken={accessToken}
                setNotifications={setNotifications}
                setNotificationOpen={setNotificationOpen}
                handleMarkRead={handleMarkRead}
              />
            )}
          </div>

          {/* SearchBar */}
          <div ref={searchRef}>
            <SearchBar open={searchOpen} setOpen={setSearchOpen} />
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
