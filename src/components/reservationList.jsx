"use client";

import React, { useState, useCallback } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "./loader";
import DownloadOptions from "./downloadOptions";
import { useAuth } from "@/contexts/authContext";
import { useReservations } from "@/hooks/useReservation";
import { ConvertStringToDate } from "../../utlis/utils";
import {
  updateReservationStatus,
  fulfillReservation,
  cancelReservation,
} from "../../utlis/userActions";

const columnHelper = createColumnHelper();

export default function ReservationList() {
  const [page, setPage] = useState(1);
  const { isAdmin, accessToken } = useAuth();
  const {
    reservations,
    loadingFetch,
    fetchError,
    totalPages,
    updateReservationStatus: updateStatus,
    fetchReservations,
  } = useReservations({ page });

  const [localReservations, setLocalReservations] = useState({});

  // Handlers for pagination
  const handleNext = useCallback(() => {
    if (page < totalPages) setPage((prev) => prev + 1);
  }, [page, totalPages]);

  const handlePrev = useCallback(() => {
    if (page > 1) setPage((prev) => prev - 1);
  }, [page]);

  // Get local reservation or fall back to original
  const getReservation = useCallback(
    (id) => localReservations[id] || reservations.find((r) => r.id === id),
    [localReservations, reservations]
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
        refetch: fetchReservations,
        toast,
      });

      if (success) {
        // Optionally remove from local state after success
        setLocalReservations((prev) => {
          const { [reservation.id]: _, ...rest } = prev;
          return rest;
        });
      }
    },
    [updateStatus, fetchReservations, setLocalReservation]
  );

  // Handle cancel action
  const handleCancel = useCallback(
    async (reservation) => {
      const success = await cancelReservation({
        reservation,
        setLocalReservation,
        updateReservationStatus: updateStatus,
        refetch: fetchReservations,
        toast,
      });

      if (success) {
        setLocalReservations((prev) => {
          const { [reservation.id]: _, ...rest } = prev;
          return rest;
        });
      }
    },
    [updateStatus, fetchReservations, setLocalReservation]
  );

  // Status badge helper
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800" },
      notified: { bg: "bg-blue-100", text: "text-blue-800" },
      fulfilled: { bg: "bg-green-100", text: "text-green-800" },
      cancelled: { bg: "bg-red-100", text: "text-red-800" },
    };

    const config = statusConfig[status] || { bg: "bg-gray-100", text: "text-gray-800" };

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
  cell: (info) => {
    const value = info.getValue();
    return value ? ConvertStringToDate(value).toLocaleString() : "-";
  },
}),

columnHelper.accessor("notified_at", {
  header: "Notified At",
  cell: (info) => {
    const value = info.getValue();
    return value ? ConvertStringToDate(value).toLocaleString() : "-";
  },
}),

columnHelper.accessor("fulfilled_at", {
  header: "Fulfilled At",
  cell: (info) => {
    const value = info.getValue();
    return value ? ConvertStringToDate(value).toLocaleString() : "-";
  },
}),

columnHelper.accessor("cancelled_at", {
  header: "Cancelled At",
  cell: (info) => {
    const value = info.getValue();
    return value ? ConvertStringToDate(value).toLocaleString() : "-";
  },
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
                  onClick={() => handleFulfill(reservation)}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors duration-200"
                  aria-label="Fulfill reservation"
                >
                  Fulfill
                </button>
                <button
                  onClick={() => handleCancel(reservation)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors duration-200"
                  aria-label="Cancel reservation"
                >
                  Cancel
                </button>
              </>
            )}
            {isFulfilled && (
              <button
                onClick={() => handleCancel(reservation)}
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
    data: reservations || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Loading state
  if (loadingFetch) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  // Error state
  if (fetchError) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500 font-medium">Error loading reservations</p>
        <p className="text-gray-600 text-sm mt-2">{fetchError}</p>
        <button
          onClick={fetchReservations}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (!reservations || reservations.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p className="text-lg font-medium">No reservations found</p>
        <p className="text-sm mt-2">There are currently no reservations to display.</p>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto mt-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-blue-400">Reservation List</h1>
        {isAdmin && (
          <DownloadOptions
            endpoint={`${process.env.NEXT_PUBLIC_API_URL}/download/reservations`}
            page={page}
            limit={20}
            token={accessToken}
          />
        )}
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
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-50 group transition-colors duration-150"
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

        {/* Pagination */}
        {totalPages > 1 && (
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
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={page === totalPages}
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