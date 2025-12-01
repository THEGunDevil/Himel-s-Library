"use client";

import { SearchIcon, X } from "lucide-react";
import { useState } from "react";

import SearchedPreview from "./searchedPreview";
import { useBookData } from "@/hooks/useBookData";
function SearchBar({ open, setOpen }) {
  const [local, setLocal] = useState("");
  const [genre, setGenre] = useState("all");
  const {genres}=useBookData()
  const handleClearText = () => setLocal("");

  return (
    <section
      className={`
        absolute top-full left-1/2 mt-1 w-full transform -translate-x-1/2
        bg-blue-200 dark:bg-slate-900 flex flex-col justify-start items-center gap-1
        transition-all duration-300 ease-out
        ${
          open
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-4 invisible"
        }
      `}
    >
      {/* Search Input */}
      <form className="flex items-center w-fit justify-between gap-1 py-2.5">
        <div className="border border-blue-400 dark:border-gray-400  h-9 sm:flex hidden items-center">
          <select
            className="h-full text-sm focus:outline-none"
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
        </div>
        <div className="border h-9 flex border-blue-400  dark:border-gray-400 sm:hidden items-center ">
          <select
            className="h-full text-sm w-20 focus:outline-none"
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
        </div>

        <input
          type="search"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="Search books..."
          className="h-9 border-blue-400 md:w-[350px] w-[180px] border p-4 dark:border-gray-400 focus:outline-none focus:ring-0"
        />

        {local && (
          <button
            type="button"
            onClick={handleClearText}
            className="h-9 border-blue-400 border w-9 flex justify-center items-center dark:border-gray-400 text-red-400 hover:text-red-600"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="mx-auto border-blue-400 border h-9 w-9 flex justify-center items-center dark:border-gray-400 text-blue-400 cursor-pointer">
          <SearchIcon className="h-5 w-5" />
        </div>
      </form>

      {/* Live Search Preview */}
      {local && (
        <div className="relative w-full sm:max-w-[750px] max-w-[420px]">
          <SearchedPreview
            value={local}
            genre={genre}
            setLocal={setLocal}
            setOpen={setOpen}
          />
        </div>
      )}
    </section>
  );
}

export default SearchBar;
