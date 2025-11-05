"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { ConvertStringToDate } from "../../utlis/utils";
import { useBorrowData } from "@/hooks/useBorrowData";
import { useUserData } from "@/hooks/useUserData";
import { useBookData } from "@/hooks/useBookData";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/authContext";
import Loader from "./loader";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import DownloadOptions from "./downloadOptions";

const columnHelper = createColumnHelper();

export default function BorrowList() {
  const [page, setPage] = useState(1);

  // ---- data hooks -------------------------------------------------
  const { data, loading, error, totalPages, refetch } = useBorrowData({ page });
  const { data: users } = useUserData({ page }); // Fixed: Pass { page } to useUserData
  const { data: books } = useBookData();
  const { accessToken } = useAuth();

  // Extract borrows array safely from API response
  const borrowsArray = Array.isArray(data?.borrows) ? data.borrows : [];
  // ---- optimistic UI state ----------------------------------------
  const [optimisticBorrows, setOptimisticBorrows] = useState(borrowsArray);
  useEffect(() => {
    if (Array.isArray(data?.borrows)) {
      setOptimisticBorrows(data.borrows);
    }
  }, [data?.borrows]);
  // ---- return handler ---------------------------------------------
  const handleReturn = async (borrowId, bookId) => {
    if (!accessToken) {
      toast.error("Authentication access token missing.");
      return;
    }

    // Optimistic UI update
    setOptimisticBorrows((prev) =>
      prev.map((b) =>
        b.id === borrowId ? { ...b, returned_at: new Date().toISOString() } : b
      )
    );

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/borrows/borrow/${borrowId}/return`,
        { book_id: bookId },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Book returned!", { autoClose: 1500 });
      refetch(); // refresh real data
    } catch (err) {
      console.error("Return error:", err);
      toast.error("Failed to return book.");
      refetch(); // revert optimistic change
    }
  };

  // ---- pagination handlers ----------------------------------------
  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  // ---- combine users + books ---------------------------------------
  const combinedData = useMemo(() => {
    if (
      !Array.isArray(optimisticBorrows) ||
      !Array.isArray(users) ||
      !Array.isArray(books)
    )
      return [];

    return optimisticBorrows.map((b) => {
      const user = users.find((u) => u.id === b.user_id) || {};
      const book = books.find((bk) => bk.id === b.book_id) || {};

      return {
        ...b,
        user_name: user.first_name
          ? `${user.first_name} ${user.last_name || ""}`
          : "Unknown User",
        book_title: book.title || b.book_title || "Unknown Book",
      };
    });
  }, [optimisticBorrows, users, books]);

  // ---- helper: check if book is returned --------------------------
  const isNotReturned = (returned_at) => {
    if (!returned_at) return true;
    return returned_at.includes("0001-01-01") || returned_at.trim() === "";
  };

  // ---- table columns ------------------------------------------------
  const columns = [
    columnHelper.accessor("user_name", { header: "User" }),
    columnHelper.accessor("book_title", { header: "Book" }),
    columnHelper.accessor("borrowed_at", {
      header: "Borrowed At",
      cell: ({ getValue }) => ConvertStringToDate(getValue()),
    }),
    columnHelper.accessor("due_date", {
      header: "Due Date",
      cell: ({ getValue }) => ConvertStringToDate(getValue()),
    }),
    columnHelper.accessor("returned_at", {
      header: "Returned At",
      cell: ({ getValue }) => {
        const v = getValue();
        return isNotReturned(v) ? (
          <span className="text-orange-600 font-medium">Not Returned</span>
        ) : (
          ConvertStringToDate(v)
        );
      },
    }),
    columnHelper.accessor("id", {
      header: "Actions",
      cell: ({ row }) => {
        const borrow = row.original;
        const notReturned = isNotReturned(borrow.returned_at);

        return notReturned ? (
          <button
            onClick={() => handleReturn(borrow.id, borrow.book_id)}
            className="
              px-3 py-1 bg-green-500 text-white text-sm rounded
              hover:bg-green-600 transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            disabled={loading}
          >
            Return
          </button>
        ) : (
          <span className="text-gray-500 text-sm">Returned</span>
        );
      },
    }),
  ];

  // ---- table instance -----------------------------------------------
  const table = useReactTable({
    data: combinedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ---- render --------------------------------------------------------
  if (loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 text-red-500">
        Error: {error.message || "Unknown error"}
      </div>
    );
  if (!combinedData.length)
    return <div className="p-6 text-gray-600">No borrow records found.</div>;
console.log(data);

  return (
    <div className="w-full mx-auto my-1">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold mb-3 text-blue-400">Borrow List</h1>
        <DownloadOptions
          endpoint={`${process.env.NEXT_PUBLIC_API_URL}/download/borrows`}
          page={page}
          limit={20}
          token={accessToken}
        />
      </div>

      <div className="overflow-x-auto border border-gray-200">
        <div className="max-h-3/4 overflow-y-auto">
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
  );
}
