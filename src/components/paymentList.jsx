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
import { ArrowLeftIcon, ArrowRightIcon, X, Copy } from "lucide-react";
import DownloadOptions from "./downloadOptions";
import { ConvertStringToDate } from "../../utils/utils";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const columnHelper = createColumnHelper();

export default function PaymentList() {
  const [page, setPage] = useState(1);
  const { isAdmin, accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payments, setPayments] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const [localSearch, setLocalSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(localSearch.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch]);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    if (!accessToken || !isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: 10,
        // ...(debouncedSearch && { search: debouncedSearch }),
      };

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/payments`,
        {
          params,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const data = res.data;
      console.log(data);
      setPayments(data.payments || data || []);
      setTotalPages(data.total_pages || data.totalPages || 1);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to load payments";
      setError(message);
      toast.error(message);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, isAdmin, page, debouncedSearch]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handlePrev = () => page > 1 && setPage((p) => p - 1);
  const handleNext = () => page < totalPages && setPage((p) => p + 1);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!", {
        icon: <Copy className="h-4 w-4" />,
        autoClose: 2000,
      });
    } catch {
      toast.error("Failed to copy");
    }
  };

  const columns = [
    columnHelper.accessor("transaction_id", {
      header: "Transaction ID",
      cell: ({ getValue }) => {
        const id = getValue();
        if (!id) return <span className="text-gray-400 text-xs">N/A</span>;
        const short = `${id.slice(0, 8)}...${id.slice(-6)}`;
        return (
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="tracking-wider">{short}</span>
            <button
              onClick={() => handleCopy(id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-blue-600"
              title="Copy full ID"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        );
      },
    }),

    columnHelper.accessor("user_name", {
      header: "User",
      cell: ({ getValue, row }) => (
        <div>
          <div className="font-medium">{getValue()}</div>
          <div className="text-xs text-gray-500">{row.original.email}</div>
        </div>
      ),
    }),

    columnHelper.accessor("amount", {
      header: "Amount",
      cell: ({ row }) => {
        const { amount, currency = "USD" } = row.original;
        return (
          <span className="font-bold text-lg">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency,
            }).format(amount)}
          </span>
        );
      },
    }),

    columnHelper.accessor("payment_gateway", {
      header: "Gateway",
      cell: ({ getValue }) => {
        const gateway = getValue()?.toUpperCase();
        const colors = {
          STRIPE: "bg-purple-100 text-purple-800",
          PAYPAL: "bg-blue-100 text-blue-800",
          COINGATE: "bg-orange-100 text-orange-800",
        };
        return (
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              colors[gateway] || "bg-gray-100 text-gray-700"
            }`}
          >
            {gateway || "Unknown"}
          </span>
        );
      },
    }),

    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue()?.toLowerCase();
        const map = {
          succeeded: { label: "Paid", color: "bg-green-100 text-green-800" },
          pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
          failed: { label: "Failed", color: "bg-red-100 text-red-800" },
          refunded: {
            label: "Refunded",
            color: "bg-purple-100 text-purple-800",
          },
        };
        const item = map[status] || {
          label: status || "Unknown",
          color: "bg-gray-100 text-gray-700",
        };

        return (
          <span
            className={`px-3 py-1.5 text-xs font-bold rounded-full ${item.color}`}
          >
            {item.label}
          </span>
        );
      },
    }),

    columnHelper.accessor("refund_status", {
      header: "Refund",
      cell: ({ getValue }) => {
        const val = getValue();
        if (!val || val === "none" || val === "") {
          return <span className="text-gray-400 text-xs">-</span>;
        }
        return (
          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
            {val}
          </span>
        );
      },
    }),

    columnHelper.accessor("created_at", {
      header: "Payment Date",
      cell: ({ getValue }) => (
        <span className="text-sm">{ConvertStringToDate(getValue())}</span>
      ),
    }),
  ];

  const table = useReactTable({
    data: payments,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full mx-auto mt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex w-full items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Payments Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage and view all transactions
            </p>
          </div>
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
              value={localSearch}
              className="px-4 py-2 border h-10 border-gray-300 rounded-md focus:outline-none w-full sm:w-64 shadow-sm text-sm"
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search user..."
            />

            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch("");
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

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            {/* Header */}
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"
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

            {/* Body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader />
                      <p className="text-gray-500 text-sm">
                        Loading payments...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={columns.length} className="py-24 text-center">
                    <div className="max-w-sm mx-auto">
                      <div className="text-red-600 text-lg font-semibold mb-2">
                        Failed to load payments
                      </div>
                      <p className="text-gray-600 text-sm mb-6">{error}</p>
                      <button
                        onClick={fetchPayments}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition shadow-md"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-32 text-center">
                    <div className="text-gray-400">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <p className="text-lg font-medium text-gray-600">
                        No payments found
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {debouncedSearch
                          ? "Try adjusting your search"
                          : "There are no transactions yet"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-blue-50/50 transition-colors duration-200 group cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-6 py-5 text-sm text-gray-800 whitespace-nowrap"
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

        {/* Optional: Add a subtle footer summary if needed later */}
        {/* <div className="px-6 py-4 bg-gray-50 border-t text-sm text-gray-600">
    Total: {payments.length} payments shown
  </div> */}

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-5 bg-gray-50 border-t gap-4">
          <div className="text-sm text-gray-600">
            Showing page <span className="font-bold">{page}</span> of{" "}
            <span className="font-bold">{totalPages}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
