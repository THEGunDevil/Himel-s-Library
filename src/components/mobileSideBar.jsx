"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  BookOpenIcon,
  ChevronDown,
  ClipboardCheck,
  LayoutDashboard,
  Library,
  ReceiptText,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import Logo from "./logo";
import Link from "next/link";
const dashBoardNavigations = [
  { title: "OverView", path: "/overview", icon: <BarChart size={17} /> },
  { title: "Users", path: "/user-list", icon: <Users size={17} /> },
  { title: "Books", path: "/book-list", icon: <BookOpenIcon size={17} /> },
  {
    title: "Reservations",
    path: "/reservation-list",
    icon: <ClipboardCheck size={17} />,
  },
  { title: "Borrows", path: "/borrow-list", icon: <Library size={17} /> },
  { title: "Payments", path: "/payment-list", icon: <ReceiptText size={17} /> },
];

export default function MobileSidebar({
  isAdmin,
  accessToken,
  navigation,
  pathname,
  setSidebarOpen,
}) {
  const [dashboardOpen, setDashboardOpen] = useState(false);
  return (
    <div className="h-full flex flex-col ">
      <div className="flex justify-between relative">
        <Link href={"/"}>
          <Logo width={82} />
        </Link>
        <div
          onClick={() => setSidebarOpen(false)}
          className="text-blue-600 cursor-pointer"
        >
          <X size={28} />
        </div>
      </div>

      <ul className="flex flex-col gap-4 uppercase font-medium text-lg mt-8">
        {navigation
          .filter((nav) => nav.hiddenOnMobile !== true)
          .map((nav) => (
            <li key={nav.path} onClick={() => setSidebarOpen(false)}>
              <Link
                href={nav.path}
                className={`hover:text-blue-400 flex dark:hover:text-blue-300 dark:text-gray-200 items-center gap-2 ${
                  pathname === nav.path
                    ? "text-blue-400 font-bold"
                    : "text-gray-700"
                }`}
              >
                {nav.icon}
                <span>{nav.title}</span>
              </Link>
            </li>
          ))}

        {/* Dashboard Dropdown */}
        {isAdmin && accessToken && (
          <li>
            <button
              onClick={() => setDashboardOpen((prev) => !prev)}
              className="w-full uppercase flex justify-between dark:text-gray-200 dark:hover:text-blue-300 items-center text-gray-700 hover:text-blue-400 rounded-md"
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard size={17} />
                <span>Dashboard</span>
              </div>
              <ChevronDown
                size={18}
                className={`transition-transform duration-200 ${
                  dashboardOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            </button>

            <AnimatePresence>
              {dashboardOpen && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col gap-3 mt-4 ml-4 overflow-hidden"
                >
                  {dashBoardNavigations.map((nav) => (
                    <li key={nav.path} onClick={() => setSidebarOpen(false)}>
                      <Link
                        href={nav.path}
                        className={`flex dark:text-gray-200 dark:hover:text-blue-300 items-center gap-2 hover:text-blue-400 ${
                          pathname === nav.path
                            ? "text-blue-400 font-bold"
                            : "text-gray-700"
                        }`}
                      >
                        {nav.icon}
                        <span>{nav.title}</span>
                      </Link>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </li>
        )}
      </ul>
    </div>
  );
}
