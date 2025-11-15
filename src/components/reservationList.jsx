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
import FilterComponent from "./filterComponent";

const columnHelper = createColumnHelper();

export default function ReservationList() {
  const [page, setPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState(""); // Filter state
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
        const errorMsg =
          error?.response?.data?.error ||
          error?.message ||
          "Failed to fetch data";
        throw new Error(errorMsg);
      }
    },
    enabled: !!selectedStatus && !!accessToken,
    retry: 1,
  });

  const [localReservations, setLocalReservations] = useState({});

  // Determine which data to use
  const tableData = selectedStatus
    ? filteredData?.reservations || []
    : reservations || [];

  const currentTotalPages = selectedStatus
    ? Math.ceil((filteredData?.total_count || 0) / 20) || 1
    : totalPages || 1;

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
    (id) => localReservations[id] || tableData.find((r) => r.id === id) || {},
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
        if (selectedStatus) {
          refetchFiltered();
        } else {
          fetchReservations(page);
        }
      }
    },
    [
      updateStatus,
      selectedStatus,
      page,
      refetchFiltered,
      fetchReservations,
      setLocalReservation,
    ]
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
        if (selectedStatus) {
          refetchFiltered();
        } else {
          fetchReservations(page);
        }
      }
    },
    [
      updateStatus,
      selectedStatus,
      page,
      refetchFiltered,
      fetchReservations,
      setLocalReservation,
    ]
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

  // Table columns
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
    columnHelper.accessor("picked_up", {
      header: "Picked Up",
      cell: ({ row }) => {
        const reservation = getReservation(row.original.id);
        const pickedUp = reservation.picked_up;

        const handleMarkPickedUp = async () => {
          try {
            await updateStatus(reservation.id, "picked_up");
            toast.success("Marked as picked up!");
            fetchReservations(page);
          } catch {
            toast.error("Failed to mark picked up");
          }
        };

        return pickedUp ? (
          <span className="text-green-600 font-medium">Yes</span>
        ) : (
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            onClick={handleMarkPickedUp}
          >
            Mark Picked Up
          </button>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const reservation = getReservation(row.original.id);
        const { status } = reservation;

        if (status === "cancelled")
          return <span className="text-gray-400">-</span>;

        return (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {status === "pending" && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFulfill(reservation);
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                  aria-label="Fulfill reservation"
                >
                  Fulfill
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel(reservation);
                  }}
                  className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                  aria-label="Cancel reservation"
                >
                  Cancel
                </button>
              </>
            )}
            {status === "fulfilled" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel(reservation);
                }}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
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

  const isLoading =
    loadingFetch ||
    isFilteredLoading ||
    Object.keys(localReservations).length > 0;
  const hasError = fetchError || filteredError;
  const errorMessage =
    hasError?.message ||
    hasError?.response?.data?.error ||
    JSON.stringify(hasError);

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Reservation List
          </h1>
          {selectedStatus && (
            <span className="text-sm text-gray-600">
              (Filtered by:{" "}
              <span className="font-semibold">{selectedStatus}</span>)
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {isAdmin && tableData.length > 0 && (
            <FilterComponent
              options={[
                { label: "Pending", value: "pending" },
                { label: "Notified", value: "notified" },
                { label: "Fulfilled", value: "fulfilled" },
                { label: "Cancelled", value: "cancelled" },
              ]}
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
                      scope="col"
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
              ) : tableData.length === 0 || hasError ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-20 text-center text-gray-500"
                  >
                    <p>No reservation found</p>
                    <p className="text-gray-600 text-sm mt-2">
                      {errorMessage}
                    </p>{" "}
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

        {/* Pagination */}
        <div className="flex justify-center items-center py-4 gap-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Previous
          </button>
          <span className="text-gray-700 text-sm font-medium">
            Page {page} of {currentTotalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page === currentTotalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
          >
            Next <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
