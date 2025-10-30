"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useUserData } from "@/hooks/useUserData";
import { ConvertStringToDate } from "@/utils";

const columnHelper = createColumnHelper();

export default function UserList() {
  const { data: users, loading, error } = useUserData();

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
  ];

  const table = useReactTable({
    data: users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Loading & Error States
  if (loading)
    return (
      <div className="p-6 text-center text-gray-600">Loading users...</div>
    );
  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        Error: {error.message || "Failed to load users"}
      </div>
    );
  if (!users || users.length === 0)
    return (
      <div className="p-6 text-center text-gray-500">No users found.</div>
    );

  return (
    <div className="w-full mx-auto mt-1">
      <h1 className="text-3xl font-bold mb-3 text-blue-400">User List</h1>

      {/* Scrollable Table Container */}
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
                  className="hover:bg-gray-50 transition-colors duration-150"
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
      </div>
    </div>
  );
}