"use client";

import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

import Loader from "./loader";
import { useAuth } from "@/contexts/authContext";
import { useForm } from "react-hook-form";
import { ArrowLeftIcon, ArrowRightIcon, User } from "lucide-react";
import Link from "next/link";
import DownloadOptions from "./downloadOptions";
import { handleBan, handleUnban } from "../../utils/userActions";
import { ConvertStringToDate } from "../../utils/utils";
import { useUserData } from "@/hooks/useUserData";

const columnHelper = createColumnHelper();

export default function UserList() {
  const [page, setPage] = useState(1);
  const [userBanID, setUserBanID] = useState(null);
  const [userUnBanID, setUserUnBanID] = useState(null);
  const { isAdmin, accessToken } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { data, loading, error, refetch } = useUserData({ page });
  const users = data?.users || [];
  const totalPages = data?.total_pages || 1;
  // ---- Handlers for pagination ----
  const handleNext = () => page < totalPages && setPage((prev) => prev + 1);
  const handlePrev = () => page > 1 && setPage((prev) => prev - 1);

  // ---- Table Columns ----
  const columns = [
    columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
      id: "fullName",
      header: "User",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("phone_number", {
      header: "Phone Number",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("created_at", {
      header: "Joined At",
      cell: (info) => {
        const rawDate = info.getValue();
        if (!rawDate) return "-";
        const date = ConvertStringToDate(rawDate);
        return date.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => {
        const role = info.getValue();
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              role === "admin"
                ? "bg-blue-100 text-blue-800"
                : role === "member"
                ? "bg-gray-100 text-gray-800 border border-gray-300"
                : "bg-gray-50 text-gray-500"
            }`}
          >
            {role === "admin" ? "Admin" : role === "member" ? "Member" : "-"}
          </span>
        );
      },
    }),
    columnHelper.accessor("is_banned", {
      header: "Status",
      cell: (info) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            info.getValue()
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {info.getValue() ? "Banned" : "Active"}
        </span>
      ),
    }),
    columnHelper.accessor("active_borrows_count", {
      header: "Borrowed Books",
      cell: (info) => info.getValue() ?? 0,
    }),

    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {user.is_banned ? (
              <button
                onClick={() => setUserUnBanID(user.id)}
                className="px-3 py-1 cursor-pointer bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors duration-200"
              >
                Unban
              </button>
            ) : (
              <button
                onClick={() => setUserBanID(user.id)}
                className="px-3 py-1 cursor-pointer bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors duration-200"
              >
                Ban
              </button>
            )}
            <Link
              href={`/profile/${user.id}`}
              className="p-1 cursor-pointer bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors duration-200"
            >
              <User size={20} />
            </Link>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ---- Ban/Unban Handlers ----
  const onBanSubmit = async (formData) => {
    await handleBan({
      userId: userBanID,
      formData,
      isAdmin,
      accessToken,
      refetch,
      resetBanID: () => setUserBanID(null),
    });
  };

  const onUnbanClick = async (userId) => {
    await handleUnban({
      userId,
      isAdmin,
      accessToken,
      refetch,
      resetUnBanID: () => setUserUnBanID(null),
    });
  };

  // ---- Loading/Error States ----
  if (loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        Error: {error.message || "Failed to load users"}
      </div>
    );
  if (!users || users.length === 0)
    return <div className="p-6 text-center text-gray-500">No users found.</div>;

  return (
    <>
      <div className="w-full mx-auto mt-1">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-3 text-blue-400">User List</h1>
          <DownloadOptions
            endpoint={`${process.env.NEXT_PUBLIC_API_URL}/download/users`}
            page={page}
            limit={20}
            token={accessToken}
          />
        </div>

        <div className="overflow-x-auto border border-gray-200">
          <div className="max-h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="group hover:bg-gray-50 transition-colors duration-150"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center items-center my-5 gap-4">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="px-4 py-2 flex items-center cursor-pointer bg-blue-400 text-white disabled:opacity-50"
            >
              <ArrowLeftIcon className="h-4" />
              Previous
            </button>
            <span className="text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="px-4 py-2 flex items-center cursor-pointer bg-blue-400 text-white disabled:opacity-50"
            >
              Next <ArrowRightIcon className="h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Ban Modal */}
      {userBanID && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <form
            onSubmit={handleSubmit(onBanSubmit)}
            className="bg-white rounded-lg p-6 w-80 shadow-lg text-center"
          >
            <h2 className="text-lg font-bold mb-4">Confirm Ban</h2>
            <p className="mb-4 text-gray-700">
              Provide details for banning this user.
            </p>

            <div className="mb-4 text-left">
              <label className="block text-sm font-medium mb-1">
                Ban Reason
              </label>
              <input
                type="text"
                {...register("ban_reason", {
                  required: "Reason is required",
                  minLength: { value: 3, message: "Too short" },
                })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter reason..."
              />
              {errors.ban_reason && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.ban_reason.message}
                </p>
              )}
            </div>

            <div className="mb-6 text-left">
              <label className="block text-sm font-medium mb-1">
                Ban Until (leave empty for permanent ban)
              </label>
              <input
                type="date"
                {...register("ban_until")}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-center gap-4">
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
              >
                Confirm Ban
              </button>
              <button
                type="button"
                onClick={() => setUserBanID(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Unban Modal */}
      {userUnBanID && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg text-center">
            <h2 className="text-lg font-bold mb-4">Confirm Unban</h2>
            <p className="mb-6">Are you sure you want to unban this user?</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => onUnbanClick(userUnBanID)}
                className="px-4 py-2 cursor-pointer bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Unban
              </button>
              <button
                onClick={() => setUserUnBanID(null)}
                className="px-4 py-2 cursor-pointer bg-gray-300 rounded hover:bg-gray-400"
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
