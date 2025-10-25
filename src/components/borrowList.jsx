"use client";

import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { ConvertStringToDate } from "@/utils";
import { useBorrowData } from "@/hooks/useBorrowData";
import { useUserData } from "@/hooks/useUserData";
import { useBookData } from "@/hooks/useBookData"; // ✅ optional if available

const columnHelper = createColumnHelper();

export default function BorrowList() {
  const { data: borrows, loading, error } = useBorrowData();
  const { data: users } = useUserData();
  const { data: books } = useBookData(); // ✅ optional

  // Combine data: map each borrow record with user & book info
  const combinedData =
    borrows?.map((b) => {
      const user = users?.find((u) => u.id === b.user_id);
      const book = books?.find((bk) => bk.id === b.book_id);

      return {
        ...b,
        user_name: user
          ? `${user.first_name} ${user.last_name}`
          : "Unknown User",
        book_title: book ? book.title : "Unknown Book",
      };
    }) || [];

  const columns = [
    columnHelper.accessor("user_name", {
      header: "User",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("book_title", {
      header: "Book",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("borrowed_at", {
      header: "Borrowed At",
      cell: ({ getValue }) => {
        const rawDate = getValue();

        if (!rawDate) return "N/A";

        const date = typeof rawDate === "string" ? new Date(rawDate) : rawDate;

        if (isNaN(date)) return "Invalid Date";

        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      },
    }),
    columnHelper.accessor("due_date", {
      header: "Due Date",
      cell: ({ getValue }) => {
        const rawDate = getValue();

        if (!rawDate) return "N/A";

        const date = typeof rawDate === "string" ? new Date(rawDate) : rawDate;

        if (isNaN(date)) return "Invalid Date";

        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      },
    }),
    columnHelper.accessor("returned_at", {
      header: "Returned At",
      cell: ({ getValue }) => {
        const raw = getValue();

        // Handle null or weird default
        if (!raw || raw.startsWith("0001-01-01")) return "Not Returned";

        const date = new Date(raw);
        if (isNaN(date)) return "Invalid Date";

        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      },
    }),
    columnHelper.accessor("actions", {
      header: "Actions",
      cell: (info) => {
        const borrow = info.row.original;

        // If already returned
        if (
          !borrow.returned_at ||
          borrow.returned_at.startsWith("0001-01-01")
        ) {
          return (
            <button
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              onClick={() => handleReturn(borrow.id)}
            >
              Return
            </button>
          );
        }

        return <span className="text-gray-500 text-sm">Returned</span>;
      },
    }),
  ];

  const table = useReactTable({
    data: combinedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) return <div className="p-6">Loading borrows...</div>;
  if (error)
    return <div className="p-6 text-red-500">Error loading borrows</div>;

  return (
    <div className="w-full m-auto mt-10">
      <h1 className="text-3xl font-bold mb-4 text-blue-400">Borrow List</h1>
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
