"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Loader from "./loader";
import DownloadOptions from "./downloadOptions";
import { useAuth } from "@/contexts/authContext";
import { useReservations } from "@/hooks/useReservation";
import { ConvertStringToDate } from "../../utils/utils";
import { fulfillReservation, cancelReservation } from "../../utils/userActions";
import { useRouter } from "next/navigation";
import FilterComponent from "./filterComponent";

const columnHelper = createColumnHelper();

export default function ReservationList() {
  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState(""); // Filter state
  const router = useRouter();
  const { isAdmin, accessToken } = useAuth();
  
  // Fetch unfiltered reservations
  const {
    reservations,
    loadingFetch,
    fetchError,
    totalPages,
    updateReservationStatus: updateStatus,
    fetchReservations,
  } = useReservations({ page });

  // Fetch filtered reservations when status is selected
const {
  data: filteredData,
  isLoading: isFilteredLoading,
  error: filteredError,
  refetch: refetchFiltered,
} = useQuery({
  queryKey: ["filteredReservations", selectedStatus, page],
  queryFn: async () => {
    try {
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
    } catch (error) {
      // Transform error to string
      const errorMsg = error?.response?.data?.error || error?.message || "Failed to fetch data";
      throw new Error(errorMsg);
    }
  },
  enabled: !!selectedStatus && !!accessToken,
  retry: 1, // Only retry once
});

  const [localReservations, setLocalReservations] = useState({});

  // Determine which data to use
  const tableData = selectedStatus
    ? filteredData?.reservations || []
    : reservations || [];
  
  const currentTotalPages = selectedStatus
    ? Math.ceil((filteredData?.total_count || 0) / 20)
    : totalPages;

  // Handlers for pagination
  const handleNext = useCallback(() => {
    if (page < currentTotalPages) setPage((prev) => prev + 1);
  }, [page, currentTotalPages]);

  const handlePrev = useCallback(() => {
    if (page > 1) setPage((prev) => prev - 1);
  }, [page]);

  // Refetch when page changes
  useEffect(() => {
    if (selectedStatus) {
      refetchFiltered();
    } else {
      fetchReservations(page);
    }
  }, [page, selectedStatus]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedStatus]);

  // Get local reservation or fall back to original
  const getReservation = useCallback(
    (id) =>
      localReservations[id] || tableData.find((r) => r.id === id) || {},
    [localReservations, tableData]
  );

  // Set local reservation
  const setLocalReservation = useCallback((reservation) => {
    setLocalReservations((prev) => ({
      ...prev,
      [reservation.id]: reservation,
    }));
  }, []);

  // Handle fulfill action
  const handleFulfill = useCallback(
    async (reservation) => {
      const success = await fulfillReservation({
        reservation,
        setLocalReservation,
        updateReservationStatus: updateStatus,
        toast,
      });

      if (success) {
        setLocalReservations((prev) => {
          const { [reservation.id]: _, ...rest } = prev;
          return rest;
        });
        // Refetch based on current filter
        if (selectedStatus) {
          refetchFiltered();
        } else {
          fetchReservations(page);
        }
      }
    },
    [updateStatus, selectedStatus, page, refetchFiltered, fetchReservations, setLocalReservation]
  );

  // Handle cancel action
  const handleCancel = useCallback(
    async (reservation) => {
      const success = await cancelReservation({
        reservation,
        setLocalReservation,
        updateReservationStatus: updateStatus,
        toast,
      });

      if (success) {
        setLocalReservations((prev) => {
          const { [reservation.id]: _, ...rest } = prev;
          return rest;
        });
        // Refetch based on current filter
        if (selectedStatus) {
          refetchFiltered();
        } else {
          fetchReservations(page);
        }
      }
    },
    [updateStatus, selectedStatus, page, refetchFiltered, fetchReservations, setLocalReservation]
  );

  // Status badge helper
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
      notified: { bg: "bg-blue-100", text: "text-blue-800" },
      fulfilled: { bg: "bg-green-100", text: "text-green-800" },
      cancelled: { bg: "bg-red-100", text: "text-red-800" },
    };

    const config = statusConfig[status] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {status}
      </span>
    );
  };

  // Table columns definition
  const columns = [
    columnHelper.accessor("user_name", {
      header: "User Name",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("book_title", {
      header: "Book Title",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor("created_at", {
      header: "Created At",
      cell: (info) => ConvertStringToDate(info.getValue()) || "-",
    }),
    columnHelper.accessor("notified_at", {
      header: "Notified At",
      cell: (info) => ConvertStringToDate(info.getValue()) || "-",
    }),
    columnHelper.accessor("fulfilled_at", {
      header: "Fulfilled At",
      cell: (info) => ConvertStringToDate(info.getValue()) || "-",
    }),
    columnHelper.accessor("cancelled_at", {
      header: "Cancelled At",
      cell: (info) => ConvertStringToDate(info.getValue()) || "-",
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const reservation = getReservation(row.original.id);
        const isPending = reservation.status === "pending";
        const isFulfilled = reservation.status === "fulfilled";
        const isCancelled = reservation.status === "cancelled";

        if (isCancelled) return <span className="text-gray-400">-</span>;

        return (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {isPending && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFulfill(reservation);
                  }}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors duration-200"
                  aria-label="Fulfill reservation"
                >
                  Fulfill
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel(reservation);
                  }}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors duration-200"
                  aria-label="Cancel reservation"
                >
                  Cancel
                </button>
              </>
            )}
            {isFulfilled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel(reservation);
                }}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors duration-200"
                aria-label="Cancel fulfilled reservation"
              >
                Cancel
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

  // Loading state
  const isLoading = loadingFetch || isFilteredLoading;
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  // Error state
  const hasError = fetchError || filteredError;
  if (hasError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-medium">Error loading reservations</p>
        <p className="text-gray-600 text-sm mt-2">{hasError}</p>
        <button
          onClick={() => {
            if (selectedStatus) {
              refetchFiltered();
            } else {
              fetchReservations(page);
            }
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (!tableData || tableData.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-lg font-medium">No reservations found</p>
        <p className="text-sm mt-2">
          {selectedStatus
            ? `No ${selectedStatus.toLowerCase()} reservations to display.`
            : "There are currently no reservations to display."}
        </p>
        {selectedStatus && (
          <button
            onClick={() => setSelectedStatus("")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Clear Filter
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full mx-auto mt-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-blue-400">Reservation List</h1>
          {selectedStatus && (
            <span className="text-sm text-gray-600">
              (Filtered by: <span className="font-semibold">{selectedStatus}</span>)
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {isAdmin && tableData.length > 0 && (
            <FilterComponent
              options={["Pending", "Fulfilled", "Notified", "Cancelled"]}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
            />
          )}
          {isAdmin && (
            <DownloadOptions
              endpoint={`${process.env.NEXT_PUBLIC_API_URL}/download/reservations`}
              page={page}
              limit={20}
              token={accessToken}
            />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <div className="max-h-[600px] overflow-y-auto">
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
              {table.getRowModel().rows.map((row) => {
                const bookID = row.original.book_id;
                return (
                  <tr
                    key={row.id}
                    className="group hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => router.push(`/book/${bookID}`)}
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
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {currentTotalPages > 1 && (
          <div className="flex justify-center items-center py-4 gap-4 bg-gray-50 border-t">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="px-4 py-2 flex items-center gap-2 bg-blue-400 text-white rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Previous page"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Previous
            </button>
            <span className="text-gray-700 font-medium">
              Page {page} of {currentTotalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={page === currentTotalPages}
              className="px-4 py-2 flex items-center gap-2 bg-blue-400 text-white rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Next page"
            >
              Next
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}