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
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import DownloadOptions from "./downloadOptions";
import { handleCancelReserve } from "../../utlis/userActions";
import { ConvertStringToDate } from "../../utlis/utils";
import { useReservations } from "@/hooks/useReservation";
import { toast } from "react-toastify";

const columnHelper = createColumnHelper();

export default function ReservationList() {
  const [page, setPage] = useState(1);
  const { isAdmin, accessToken } = useAuth();
  const {
    reservations,
    loadingFetch,
    fetchError,
    totalPages,
    refetch,
    refetchByBookIDAndUserID,
    updateReservationStatus,
  } = useReservations({ page });
  // ---- Handlers for pagination ----
  const handleNext = () => page < totalPages && setPage((prev) => prev + 1);
  const handlePrev = () => page > 1 && setPage((prev) => prev - 1);
  const [localReserves, setLocalReserves] = useState(null);

  // ---- Table Columns ----
  const columns = [
    columnHelper.accessor((row) => row.user_name, {
      id: "fullName",
      header: "User Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor((row) => row.book_title, {
      id: "book",
      header: "Book Title",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor((row) => row.status, {
      id: "status",
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        const colors =
          status === "pending"
            ? "bg-yellow-100 text-yellow-800"
            : status === "fulfilled"
            ? "bg-green-100 text-green-800"
            : status === "cancelled"
            ? "bg-red-100 text-red-800"
            : "";
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${colors}`}
          >
            {status}
          </span>
        );
      },
    }),

    columnHelper.accessor("created_at", {
      header: "Created At",
      cell: (info) =>
        info.getValue()
          ? ConvertStringToDate(info.getValue()).toLocaleString()
          : "-",
    }),
    columnHelper.accessor("notified_at", {
      header: "Notified At",
      cell: (info) =>
        info.getValue()
          ? ConvertStringToDate(info.getValue()).toLocaleString()
          : "-",
    }),
    columnHelper.accessor("fulfilled_at", {
      header: "Fulfilled At",
      cell: (info) =>
        info.getValue()
          ? ConvertStringToDate(info.getValue()).toLocaleString()
          : "-",
    }),
    columnHelper.accessor("cancelled_at", {
      header: "Cancelled At",
      cell: (info) =>
        info.getValue()
          ? ConvertStringToDate(info.getValue()).toLocaleString()
          : "-",
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const reservation = row.original;
        return (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {reservation.status === "pending" && (
              <>
                <button
                  onClick={async () => {
                    try {
                      setLocalReserves({ ...reservation, status: "fulfilled" });
                      await updateReservationStatus(
                        reservation.id,
                        "fulfilled"
                      );
                      toast.success("✅ Reservation fulfilled");
                      await refetchByBookIDAndUserID(
                        reservation.book_id,
                        reservation.user_id
                      );
                    } catch (err) {
                      toast.error("❌ Error fulfilling reservation");
                    }
                  }}
                >
                  Fulfill
                </button>

                <button
                  onClick={() =>
                    handleCancelReserve({
                      localReserves,
                      setLocalReserves,
                      updateReservationStatus,
                      refetchByBookIDAndUserID,
                      toast,
                    })
                  }
                  className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </>
            )}
            {reservation.status === "fulfilled" && (
              <div className="flex items-center space-x-3">
                <span className="cursor-pointer">Fulfilled</span>
                <button
                  onClick={() =>
                    handleCancelReserve({
                      localReserves,
                      setLocalReserves,
                      updateReservationStatus,
                      refetchByBookIDAndUserID,
                      toast,
                    })
                  }
                  className="px-2 py-1 bg-red-500 cursor-pointer text-white text-sm rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
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

  // ---- Loading/Error States ----
  if (loadingFetch) return <Loader />;
  if (fetchError)
    return (
      <div className="p-6 text-center text-red-500">
        Error: {error.message || "Failed to load users"}
      </div>
    );
  if (!reservations || reservations.length === 0)
    return (
      <div className="p-6 text-center text-gray-500">
        No reservations found.
      </div>
    );

  return (
    <>
      <div className="w-full mx-auto mt-1">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-3 text-blue-400">
            Reservation List
          </h1>
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
                  <tr key={row.id} className="hover:bg-gray-50 group">
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
    </>
  );
}
