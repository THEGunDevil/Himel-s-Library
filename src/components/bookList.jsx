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
import { useEffect, useState, useCallback, useRef } from "react";
import { ArrowLeftIcon, ArrowRightIcon, X } from "lucide-react";
import DownloadOptions from "./downloadOptions";
import { useRouter } from "next/navigation";

const columnHelper = createColumnHelper();

export default function BookList({setSelectedIndex,setUpdateBookID}) {
  const [page, setPage] = useState(1);
  const [genre, setGenre] = useState("all");
  const [genres, setGenres] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [local, setLocal] = useState("");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch((local || "").trim());
    }, 300);

    return () => clearTimeout(t);
  }, [local]);

  const { isAdmin, accessToken } = useAuth();
  const [bookToDelete, setBookToDelete] = useState(null);
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/books/genres`
        );
        if (Array.isArray(res.data)) {
          setGenres(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch genres:", err);
      }
    };
    fetchGenres();
  }, []);
  const {
    data: books,
    loading: baseLoading,
    error,
    refetch,
    totalPages: baseTotalPages,
  } = useBookData({ page });

  const fetchFilteredBooks = useCallback(async () => {
    const trimmed = debouncedSearch;

    if (!trimmed) {
      setFilteredBooks([]);
      setTotalPages(baseTotalPages || 1);
      return;
    }

    try {
      setLoading(true);

      const params = {
        query: trimmed,
        page,
        limit: 10,
        genre: genre || "all",
      };

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/books/search`,
        { params }
      );

      setFilteredBooks(res.data.books || []);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      console.error(err);
      setFilteredBooks([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, genre, baseTotalPages]);

  useEffect(() => {
    fetchFilteredBooks();
  }, [debouncedSearch, page, genre]);

  const handleNext = () => page < totalPages && setPage((p) => p + 1);
  const handlePrev = () => page > 1 && setPage((p) => p - 1);

  const handleDelete = async () => {
    if (!bookToDelete) return;
    if (!isAdmin || !accessToken) {
      toast.error("You are not authorized to delete books.");
      return;
    }
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/books/${bookToDelete}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      toast.success("Book deleted successfully!");
      setBookToDelete(null);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete book.");
    }
  };

  const tableData = debouncedSearch ? filteredBooks : books || [];
  const table = useReactTable({
    data: tableData,
    columns: [
      columnHelper.accessor("id", {
        header: "ID",
        cell: ({ getValue }) => {
          const id = getValue();
          const shortId = id ? id.slice(0, 8) + "..." : "N/A";
          return (
            <div className="flex items-center gap-2 group">
              <span className="font-mono">{shortId}</span>
              <button
                onClick={() => navigator.clipboard.writeText(id)}
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
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const book = row.original;
          return (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(5)
                  setUpdateBookID(book.id)
                }}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
              >
                Update
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setBookToDelete(book.id);
                }}
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          );
        },
      }),
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, genre]);
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // put cursor back in input
    }
  }, [debouncedSearch, page, genre]); // trigger on events that reload data

  // if (baseLoading || loading) return <Loader />;
  if (error)
    return (
      <div className="p-6 text-red-500 bg-red-50 rounded-lg shadow-md">
        {error.message}
      </div>
    );

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Book List
        </h1>
        <div className="flex items-center w-full sm:w-auto gap-2">
          <select
            className="px-4 py-2 h-10 w-20 border border-gray-300 rounded-md focus:outline-none shadow-sm text-sm hidden sm:block"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          >
            <option value="all">ALL</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <input
            type="search"
            value={local}
            ref={inputRef} // attach ref
            className="px-4 py-2 border h-10 border-gray-300 rounded-md focus:outline-none w-full sm:w-64 shadow-sm text-sm"
            onChange={(e) => setLocal(e.target.value)}
            placeholder="Search book..."
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

        <DownloadOptions
          endpoint={`${process.env.NEXT_PUBLIC_API_URL}/download/books`}
          page={page}
          limit={10}
          token={accessToken}
        />
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
      {baseLoading || loading ? (
        <tbody>
          <tr>
            <td colSpan={table.getAllColumns().length} className="py-20 text-center">
              <Loader />
            </td>
          </tr>
        </tbody>
      ) : (
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="group hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              onClick={() => router.push(`/book/${row.original.id}`)}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      )}
          </table>
        </div>

        <div className="flex justify-center items-center py-4 gap-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handlePrev}
            disabled={page === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Previous
          </button>
          <span className="text-gray-700 text-sm font-medium">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={page === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2 text-sm font-medium"
          >
            Next
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Delete Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-xl text-center">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Confirm Delete
            </h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this book?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setBookToDelete(null)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-200 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
