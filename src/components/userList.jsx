"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import axios from "axios";
import Loader from "./loader";
import { useAuth } from "@/contexts/authContext";
import { ArrowLeftIcon, ArrowRightIcon, X } from "lucide-react";
import DownloadOptions from "./downloadOptions";
import { handleBan, handleUnban } from "../../utils/userActions";
import { ConvertStringToDate } from "../../utils/utils";
import { useUserData } from "@/hooks/useUserData";
import Pagination from "./pagination";

const columnHelper = createColumnHelper();

export default function UserList() {
  const [page, setPage] = useState(1);
  const [userToBan, setUserToBan] = useState(null);
  const [userToUnban, setUserToUnban] = useState(null);
  const { isAdmin, accessToken } = useAuth();
  const [filteredLoading, setFilteredLoading] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [local, setLocal] = useState("");
  // 🧠 Normal user data (paginated)
  const {
    data: users,
    loading,
    error,
    totalPages: baseTotalPages,
    refetch,
  } = useUserData({ page });
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch((local || "").trim());
    }, 300);

    return () => clearTimeout(t);
  }, [local]);
  // 🔍 Search query
  const fetchFilteredUsers = useCallback(async () => {
    const trimmed = debouncedSearch;

    if (!trimmed) {
      setFilteredUsers([]);
      setTotalPages(baseTotalPages || 1);
      return;
    }

    try {
      setFilteredLoading(true);

      const params = {
        email: trimmed,
        page,
        limit: 10,
      };

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/users/user/email`,
        {
          params,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setFilteredUsers(res.data.users || []);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      console.error(err);
      setFilteredUsers([]);
      setTotalPages(1);
    } finally {
      setFilteredLoading(false);
    }
  }, [debouncedSearch, page, baseTotalPages]);

  useEffect(() => {
    if (!debouncedSearch) {
      setFilteredUsers([]);
      setTotalPages(baseTotalPages || 1); // sync with normal paginated data
    } else {
      fetchFilteredUsers();
    }
  }, [debouncedSearch, page, baseTotalPages, fetchFilteredUsers]);

  const handleNext = () => page < totalPages && setPage((prev) => prev + 1);
  const handlePrev = () => page > 1 && setPage((prev) => prev - 1);

  // 🧭 Choose which data to show
  const tableData = debouncedSearch ? filteredUsers : users || [];

  // Handle ban
  const handleBanConfirm = async () => {
    if (!userToBan) return;
    if (!isAdmin || !accessToken) {
      toast.error("You are not authorized to ban users.");
      return;
    }
    try {
      await handleBan(userToBan, accessToken);
      toast.success("User banned successfully!");
      setUserToBan(null);
      refetch();
    } catch (err) {
      console.error("Ban error:", err);
      toast.error("Failed to ban user.");
    }
  };

  // Handle unban
  const handleUnbanConfirm = async () => {
    if (!userToUnban) return;
    if (!isAdmin || !accessToken) {
      toast.error("You are not authorized to unban users.");
      return;
    }
    try {
      await handleUnban(userToUnban, accessToken);
      toast.success("User unbanned successfully!");
      setUserToUnban(null);
      refetch();
    } catch (err) {
      console.error("Unban error:", err);
      toast.error("Failed to unban user.");
    }
  };

  // Copy handler
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!", { autoClose: 1000 });
    } catch {
      toast.error("Failed to copy.");
    }
  };

  // Initialize table
  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: ({ getValue }) => {
        const id = getValue();
        const shortId = id ? id.slice(0, 8) + "..." : "N/A";
        return (
          <div className="flex items-center gap-2 group">
            <span className="font-mono">{shortId}</span>
            <button
              onClick={() => handleCopy(id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-blue-500"
              title="Copy ID"
            >
              📋
            </button>
          </div>
        );
      },
    }),
    columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
      id: "fullName",
      header: "User",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("email", { header: "Email" }),
    columnHelper.accessor("phone_number", { header: "Phone" }),
    columnHelper.accessor("created_at", {
      header: "Joined",
      cell: (info) => ConvertStringToDate(info.getValue()),
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (info) =>
        info.getValue() ? (
          <span className="p-1 text-yellow-500 border border-yellow-500 rounded font-medium">
            Admin
          </span>
        ) : (
          <span className="p-1 text-gray-500 border border-gray-500 rounded font-medium">
            Member
          </span>
        ),
    }),
    columnHelper.accessor("is_banned", {
      header: "Status",
      cell: (info) =>
        info.getValue() ? (
          <span className="text-red-500 font-medium">Banned</span>
        ) : (
          <span className="text-green-500 font-medium">Active</span>
        ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex gap-2 sm:opacity-0 opacity-100 sm:group-hover:opacity-100 transition-opacity duration-200">
            {user.is_banned ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUserToUnban(user.id);
                }}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
              >
                Unban
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUserToBan(user.id);
                }}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
              >
                Ban
              </button>
            )}
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const isLoading = filteredLoading || loading;
  const hasError = error;
  const errorMessage =
    hasError?.message ||
    hasError?.response?.data?.error ||
    JSON.stringify(hasError);

  return (
    <div className="w-full mx-auto mt-8">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
            User List
          </h1>
          <div className="sm:hidden flex gap-x-1.5">
            <DownloadOptions
              endpoint={`${process.env.NEXT_PUBLIC_API_URL}/download/users`}
              page={page}
              limit={10}
              token={accessToken}
              filters={{ search: debouncedSearch }}
            />
          </div>
        </div>
        <div className="flex items-center gap-3 justify-center">
          <div className="flex items-center w-full sm:w-auto gap-2">
            <input
              type="search"
              value={local}
              className="px-4 py-2 border h-10 border-gray-300 rounded-md focus:outline-none w-full sm:w-64 shadow-sm text-sm"
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Search user..."
            />

            {local && (
              <button
                type="button"
                onClick={() => {
                  setLocal("");
                  setPage(1);
                }}
                className="p-2 text-red-500 cursor-pointer hover:text-red-600 transition-colors duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="hidden sm:block">
            <DownloadOptions
              endpoint={`${process.env.NEXT_PUBLIC_API_URL}/download/users`}
              page={page}
              limit={10}
              token={accessToken}
              filters={{ search: debouncedSearch }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white border border-gray-200 shadow-md rounded-lg">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0 z-10 dark:bg-slate-900">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 whitespace-nowrap text-left text-xs font-semibold dark:text-gray-300 text-gray-600 uppercase tracking-wider"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white dark:bg-slate-800 dark:border-slate-700 divide-y divide-gray-200 dark:divide-gray-600">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="py-20 text-center">
                    <Loader />
                  </td>
                </tr>
              ) : hasError ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-20 text-center text-red-500"
                  >
                    <p>Error loading users</p>
                    <p className="text-gray-600 text-sm mt-2">{errorMessage}</p>
                    <button
                      onClick={() => refetch()}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : tableData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-20 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="group hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm dark:text-gray-400 text-gray-800"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex dark:bg-slate-900 dark:border-slate-700 relative flex-col sm:flex-row justify-between items-center py-5 bg-gray-50 border-t gap-4">
          <Pagination page={page} totalPages={totalPages} onPrev={handlePrev} onNext={handleNext}/>
        </div>
      </div>

      {userToBan && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-xl text-center">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Confirm Ban
            </h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to ban this user?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleBanConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
              >
                Yes, Ban
              </button>
              <button
                onClick={() => setUserToBan(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unban Modal */}
      {userToUnban && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-xl text-center">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Confirm Unban
            </h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to unban this user?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleUnbanConfirm}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
              >
                Yes, Unban
              </button>
              <button
                onClick={() => setUserToUnban(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
