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
  console.log(users);

  const columns = [
    columnHelper.accessor((row) => `${row.first_name} ${row.last_name}`, {
      id: "fullName", // optional, must be unique
      header: "User",
      cell: (info) => info.getValue(), // will show "Firstname Lastname"
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("phone_number", {
      header: "Phone Number",
      cell: (info) => info.getValue(),
    }),
    // columnHelper.accessor("borrowed", {
    //   header: "Borrowed",
    //   cell: (info) => (
    //     <span
    //       className={`px-2 py-1 rounded ${
    //         info.getValue() === "admin"
    //           ? "bg-blue-500 text-white"
    //           : info.getValue() === "member"
    //           ? "bg-none text-black"
    //           : null
    //       }`}
    //     >
    //       {info.getValue() === "admin"
    //         ? "Admin"
    //         : info.getValue() === "member"
    //         ? "Member"
    //         : null}
    //     </span>
    //   ),
    // }),
    columnHelper.accessor("created_at", {
      header: "Joined At",
      cell: (info) => {
        const rawDate = info.getValue();
        const date = ConvertStringToDate(rawDate);

        // Format nicely, e.g. "Oct 15, 2025, 8:30 PM"
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
      cell: (info) => (
        <span
          className={`px-2 py-1 rounded ${
            info.getValue() === "admin"
              ? "bg-blue-500 text-white"
              : info.getValue() === "member"
              ? "bg-none text-black border-gray-500 border"
              : null
          }`}
        >
          {info.getValue() === "admin"
            ? "Admin"
            : info.getValue() === "member"
            ? "Member"
            : null}
        </span>
      ),
    }),
    // columnHelper.accessor("actions", {
    //   header: "Actions",
    //   cell: (info) => (
    //     <span
    //       className={`px-2 py-1 rounded text-white ${
    //         info.getValue() === "admin"
    //           ? "bg-blue-500"
    //           : info.getValue() === "member"
    //           ? "bg-green-500"
    //           : null
    //       }`}
    //     >
    //       {info.getValue() === "admin"
    //         ? "Admin"
    //         : info.getValue() === "Member"
    //         ? "Member"
    //         : null}
    //     </span>
    //   ),
    // }),
  ];

  const table = useReactTable({
    data: users || [], // ✅ correct key
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) return <div className="p-6">Loading users...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading users</div>;

  return (
    <div className="w-full m-auto mt-10">
      <h1 className="text-3xl font-bold mb-4 text-blue-400">User List</h1>
      <table className="min-w-full shadow-md">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="text-left px-4 py-2 border-b border-gray-200 font-semibold"
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
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-4 py-2 border-b border-gray-200"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
