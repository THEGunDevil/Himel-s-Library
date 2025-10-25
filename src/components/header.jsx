"use client";
import Link from "next/link";
import Logo from "./logo";
import { usePathname, useRouter } from "next/navigation";
import { Search, SidebarIcon, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/contexts/authContext";
import SearchBar from "./searchBar";
export default function Header() {
  const { token, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const sidebarRef = useRef(null);
  const toggleRef = useRef(null); // Ref for the hamburger button
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { title: "Home", path: "/" },
    { title: "About us", path: "/about" },
    { title: "Contact us", path: "/contact" },
    ...(token ? [{ title: "Profile", path: "/profile" }] : []),
    ...(isAdmin
      ? [
          {
            title: "Dashboard",
            path: "/dashboard",
            hiddenOnMobile: true,
          },
        ]
      : []),
    ...(!token
      ? [
          { title: "Log In", path: "/auth/log-in" },
          { title: "Sign Up", path: "/auth/sign-up" },
        ]
      : []),
  ];

  // Close sidebar when clicking outside (ignoring the toggle button)
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen, isAdmin]);
  const handleSearchDropDown = () => {
    setOpen((prev) => !prev);
  };

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
      <header className="w-full fixed top-0 z-50 bg-blue-200 border-b border-blue-300 flex items-center justify-between px-4 lg:px-30 xl:px-60 h-24 md:h-32">
        {/* Logo */}
        <Link href="/" className="hidden md:flex items-center">
          <Logo width={112} />
        </Link>
        <Link href="/" className="flex md:hidden items-center">
          <Logo width={82} />
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

        {/* Sidebar */}
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

          <ul className="flex flex-col gap-6 uppercase font-medium text-lg mt-4">
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
        <div className="flex items-center gap-2">
          <button
            onClick={handleSearchDropDown}
            className="hidden md:block p-2 bg-white rounded-full"
          >
            <Search className="text-blue-400" />
          </button>
          <SearchBar open={open} />

          <div ref={toggleRef} className="flex md:hidden items-center gap-2">
            <button
              onClick={handleSearchDropDown}
              className="p-2 bg-white rounded-full"
            >
              <Search className="text-blue-400" />
            </button>
            <button onClick={() => setSidebarOpen((prev) => !prev)}>
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
