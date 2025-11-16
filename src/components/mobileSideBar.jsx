"use client";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpenIcon, ChevronDown, ClipboardCheck, LayoutDashboard, Library, Users, X } from "lucide-react";
import { useState } from "react";
import Logo from "./logo";
import Link from "next/link";

const dashBoardNavigations = [
  { title: "Users", path: "/user-list", icon: <Users size={17} /> },
  { title: "Books", path: "/book-list", icon: <BookOpenIcon size={17} /> },
  { title: "Reservations", path: "/reservation-list", icon: <ClipboardCheck size={17} /> },
  { title: "Borrows", path: "/borrow-list", icon: <Library size={17} /> },
];

export default function MobileSidebar({ navigation, pathname, setSidebarOpen }) {
  const [dashboardOpen, setDashboardOpen] = useState(false);

  return (
    <div className="h-full flex flex-col relative">
      <div
        onClick={() => setSidebarOpen(false)}
        className="absolute text-blue-600 right-5 top-5 cursor-pointer"
      >
        <X size={28} />
      </div>

      <Logo width={82} />

      <ul className="flex flex-col gap-4 uppercase font-medium text-lg mt-8">
        {navigation.map((nav) => (
          <li key={nav.path} onClick={() => setSidebarOpen(false)}>
            <Link
              href={nav.path}
              className={`hover:text-blue-400 flex items-center gap-2 ${
                pathname === nav.path ? "text-blue-400 font-bold" : "text-gray-700"
              }`}
            >
              {nav.icon}
              <span>{nav.title}</span>
            </Link>
          </li>
        ))}

        {/* Dashboard Dropdown */}
        <li>
          <button
            onClick={() => setDashboardOpen((prev) => !prev)}
            className="w-full uppercase flex justify-between items-center text-gray-700 hover:text-blue-400 rounded-md"
          >
            <div className="flex items-center gap-2">
              <LayoutDashboard size={17} />
              <span>Dashboard</span>
            </div>
            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${dashboardOpen ? "rotate-180" : "rotate-0"}`}
            />
          </button>

          <AnimatePresence>
            {dashboardOpen && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex flex-col gap-2 mt-2 ml-4 overflow-hidden"
              >
                {dashBoardNavigations.map((nav) => (
                  <li key={nav.path} onClick={() => setSidebarOpen(false)}>
                    <Link
                      href={nav.path}
                      className={`flex items-center gap-2 hover:text-blue-400 ${
                        pathname === nav.path ? "text-blue-400 font-bold" : "text-gray-700"
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
      </ul>
    </div>
  );
}
