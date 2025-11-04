"use client";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useBookData } from "@/hooks/useBookData";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/authContext";
import Loader from "./loader";
import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import DownloadOptions from "./downloadOptions";

const columnHelper = createColumnHelper();

export default function BookList() {
  // ---- hooks -------------------------------------------------
  const [page, setPage] = useState(1);

  const {
    data: books,
    loading,
    error,
    refetch,
    totalPages,
  } = useBookData({ page });
  const { isAdmin, accessToken } = useAuth();
  const [bookToDelete, setBookToDelete] = useState(null); // store selected book

  // ---- delete handler ----------------------------------------
  const handleDelete = async () => {
    if (!bookToDelete) return;
    if (!isAdmin || !accessToken) {
      toast.error("You are not authorized to delete books.");
      return;
    }

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/books/${bookToDelete}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      toast.success("Book deleted successfully!");
      setBookToDelete(null);
      refetch();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete book.");
    }
  };

  // ---- copy handler ------------------------------------------
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!", { autoClose: 1000 });
    } catch {
      toast.error("Failed to copy.");
    }
  };
  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };
  // ---- columns -----------------------------------------------
  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: ({ getValue }) => {
        const id = getValue();
        const shortId = id ? id.slice(0, 8) + "..." : "N/A";
        return (
          <div className="flex items-center gap-2 group">
            <span className="font-mono">{shortId}</span>
            <button
              onClick={() => handleCopy(id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-blue-500"
              title="Copy ID"
            >
              📋
            </button>
          </div>
        );
      },
    }),
    columnHelper.accessor("title", { header: "Book Title" }),
    columnHelper.accessor("author", { header: "Author" }),
    columnHelper.accessor("available_copies", { header: "Available Copies" }),
    columnHelper.accessor("total_copies", { header: "Total Copies" }),

    // ---- actions ----------------------------------------------
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const book = row.original;
        return (
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={() => setBookToDelete(book.id)}
              className="px-3 py-1 cursor-pointer bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors duration-200"
            >
              Delete
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: books,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ---- render ------------------------------------------------
  if (loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 text-red-500">
        Error: {error.message || "Unknown error"}
      </div>
    );
  if (!books.length)
    return <div className="p-6 text-gray-600">No books records found.</div>;

  return (
    <>
      <div className="w-full mx-auto my-1">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-3 text-blue-400">Book List</h1>
          <DownloadOptions
            endpoint={`${process.env.NEXT_PUBLIC_API_URL}/download/books`}
            page={page}
            limit={10}
            token={accessToken}
          />
        </div>
        {/* Table Container */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <div className="max-h-[75vh] overflow-y-auto">
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
                    className="group hover:bg-gray-50 transition-colors duration-150"
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

      {/* Delete Confirmation Dialog */}
      {bookToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg text-center">
            <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete this book?</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="px-4 py-2 cursor-pointer bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setBookToDelete(null)}
                className="px-4 py-2 cursor-pointer bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
