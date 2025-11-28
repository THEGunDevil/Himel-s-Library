"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { ConvertStringToDate } from "../../utils/utils";
import { useBorrowData } from "@/hooks/useBorrowData";
import { useAuth } from "@/contexts/authContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "./loader";
import { ArrowLeftIcon, ArrowRightIcon, X } from "lucide-react";
import DownloadOptions from "./downloadOptions";
import { useQuery } from "@tanstack/react-query";
import FilterComponent from "./filterComponent";
import Pagination from "./pagination";

const columnHelper = createColumnHelper();

export default function BorrowList() {
  const [page, setPage] = useState(1);
  const [local, setLocal] = useState("");
  const [searchedBorrows, setSearchedBorrows] = useState([]);
  const [searching, setSearching] = useState(false);
  const [option, setOption] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState(""); // Filter state
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const {
    data,
    loading,
    error,
    totalPages: baseTotalPages,
    refetch,
  } = useBorrowData({ page });
  const [totalPages, setTotalPages] = useState(1);
  const { accessToken, isAdmin } = useAuth();
  const borrows = data?.borrows || [];
  const inputRef = useRef(null);
  // ---- Debounced search effect ----
  useEffect(() => {
    if (option === "all") {
      setDebouncedSearch(""); // clear search if option is "all"
      setSearchedBorrows([]);
      setTotalPages(baseTotalPages || 1);
      return;
    }

    const t = setTimeout(() => {
      setDebouncedSearch((local || "").trim());
    }, 300);

    return () => clearTimeout(t);
  }, [local, option]);
  const {
    data: filteredData,
    isLoading: isFilteredLoading,
    error: filteredError,
    refetch: refetchFiltered,
  } = useQuery({
    queryKey: ["filteredBorrows", selectedStatus, page],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/list/data-paginated`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            page,
            limit: 20,
            status: selectedStatus.toLowerCase(),
          },
        }
      );
      return res.data;
    },
    enabled: !!selectedStatus && !!accessToken,
    retry: 1,
  });

  const fetchFilteredBorrows = useCallback(async () => {
    // Only search if a valid option is selected
    if (option !== "user_name" && option !== "book_title") return;

    const trimmed = debouncedSearch;
    if (!trimmed) {
      setSearchedBorrows([]);
      setTotalPages(baseTotalPages || 1);
      return;
    }

    try {
      setSearching(true);

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/list/data-paginated`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            query: trimmed,
            status: option, // ← Changed from "option" to "status" for consistency with backend
            page,
            limit: 10,
          },
        }
      );

      setSearchedBorrows(res.data.borrows || []);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      console.error(err);
      setSearchedBorrows([]);
      setTotalPages(1);
    } finally {
      setSearching(false);
    }
  }, [debouncedSearch, page, accessToken, option, baseTotalPages]);

  useEffect(() => {
    fetchFilteredBorrows();
  }, [debouncedSearch, page, option]);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, option]);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // put cursor back in input
    }
  }, [debouncedSearch, page]); // trigger on events that reload data

  // ---- Optimistic UI ----
  const [optimisticBorrows, setOptimisticBorrows] = useState(borrows);
  useEffect(() => {
    if (borrows.length) setOptimisticBorrows(borrows);
  }, [borrows]);

  // ---- Handle return ----
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
      if (selectedStatus) {
        refetchFiltered();
      } else {
        refetch();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to return book.");
      if (selectedStatus) {
        refetchFiltered(); // revert optimistic change
      } else {
        refetch(); // revert optimistic change
      }
    }
  };

  // ---- Pagination handlers ----
  const handleNext = () => page < totalPages && setPage((prev) => prev + 1);
  const handlePrev = () => page > 1 && setPage((prev) => prev - 1);

  // ---- Helper to check returned status ----
  const isNotReturned = (returned_at) =>
    !returned_at ||
    returned_at.includes("0001-01-01") ||
    returned_at.trim() === "";

  // ---- Table columns ----
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
      cell: ({ getValue }) =>
        isNotReturned(getValue()) ? (
          <span className="text-orange-600 font-medium">Not Returned</span>
        ) : (
          ConvertStringToDate(getValue())
        ),
    }),
    columnHelper.accessor("id", {
      header: "Actions",
      cell: ({ row }) => {
        const borrow = row.original;
        return isNotReturned(borrow.returned_at) ? (
          <button
            onClick={() => handleReturn(borrow.id, borrow.book_id)}
            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
  // Determine which data to use
  // const tableData = selectedStatus
  //   ? filteredData?.borrows || []
  //   ? optimisticBorrows || [] ? searchedBorrows || [] :[];

  const tableData = selectedStatus
    ? filteredData?.borrows || []
    : debouncedSearch
    ? searchedBorrows || []
    : optimisticBorrows || [];

  // ---- Table instance ----
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ---- Render ----
  const isLoading = loading || isFilteredLoading || searching;
  const hasError = error || filteredError;
  const errorMessage =
    hasError?.message ||
    hasError?.response?.data?.error ||
    JSON.stringify(hasError);

  return (
    <div className="w-full mx-auto mt-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex w-full items-center gap-4 justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Borrow List
          </h1>
          {isAdmin && (
            <div className="sm:hidden block">
              <DownloadOptions
                endpoint={`${process.env.NEXT_PUBLIC_API_URL}/download/borrows`}
                page={page}
                limit={20}
                token={accessToken}
                filters={{
                  column: option !== "all" ? option : undefined,
                  search: debouncedSearch || undefined,
                  status: selectedStatus || undefined, // borrowed_at / returned_at / not_returned
                  limit: 20,
                  offset: (page - 1) * 20,
                }}
              />
            </div>
          )}
          {selectedStatus && (
            <span className="text-sm text-gray-600">
              (Filtered by:{" "}
              <span className="font-semibold">{selectedStatus}</span>)
            </span>
          )}
        </div>
        <div className="flex items-center w-full sm:w-auto gap-2">
            <select
              className="px-4 py-2 h-10 w-20 border border-gray-300 rounded-md focus:outline-none shadow-sm text-sm"
              value={option}
              onChange={(e) => setOption(e.target.value)}
            >
              <option value="all">All</option>
              <option value="user_name">User</option>
              <option value="book_title">Book</option>
            </select>

          <input
            type="search"
            value={local}
            ref={inputRef}
            className={`px-4 py-2 border h-10 border-gray-300 rounded-md focus:outline-none w-full sm:w-64 shadow-sm text-sm ${
              option === "all" ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            onChange={(e) => setLocal(e.target.value)}
            placeholder={
              option !== "user_name" && option !== "book_title"
                ? "Select search type first"
                : "Search borrows..."
            }
            disabled={option !== "user_name" && option !== "book_title"}
          />

          {local && (
            <button
              type="button"
              onClick={() => {
                setLocal("");
                setPage(1);
                inputRef.current.focus(); // keep cursor focused
              }}
              className="p-2 text-red-500 cursor-pointer hover:text-red-600 transition-colors duration-200"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <div className="flex gap-2 items-center justify-end">
          {isAdmin && tableData.length > 0 && (
            <FilterComponent
              options={[
                { label: "Borrowed At", value: "borrowed_at" },
                { label: "Returned At", value: "returned_at" },
                { label: "Not Returned", value: "not_returned" },
              ]}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            />
          )}
          {isAdmin && (
            <div className="hidden sm:block">
              <DownloadOptions
                endpoint={`${process.env.NEXT_PUBLIC_API_URL}/download/borrows`}
                page={page}
                limit={20}
                token={accessToken}
                filters={{
                  column: option !== "all" ? option : undefined,
                  search: debouncedSearch || undefined,
                  status: selectedStatus || undefined, // borrowed_at / returned_at / not_returned
                  limit: 20,
                  offset: (page - 1) * 20,
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
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
                    <p>Error loading borrows</p>
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
                    No borrows found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="group hover:bg-gray-50 transition-colors duration-200"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
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

        <div className="flex relative flex-col sm:flex-row justify-between items-center px-6 py-5 bg-gray-50 border-t gap-4">
          <Pagination page={page} totalPages={totalPages} onPrev={handlePrev} onNext={handleNext}/>
        </div>
      </div>
    </div>
  );
}
