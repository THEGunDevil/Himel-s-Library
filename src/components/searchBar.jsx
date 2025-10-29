"use client";

import { SearchIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import SearchedPreview from "./searchedPreview";
function SearchBar({ open }) {
  const [local, setLocal] = useState("");
  const [genre, setGenre] = useState("all");
  const [genres, setGenres] = useState([]);
  const handleClearText = () => setLocal("");

  // Fetch genres dynamically
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
  return (
    <section
      className={`
        absolute top-full left-1/2 mt-1 w-full transform -translate-x-1/2
        bg-blue-200 flex flex-col justify-start items-center gap-1
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
        <div className="border h-[36px] sm:flex hidden items-center">
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
        <div className="border h-[36px] flex sm:hidden items-center ">
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
          className="h-[36px] md:w-[350px] w-[180px] border p-4 focus:outline-none focus:ring-0"
        />

        {local && (
          <button
            type="button"
            onClick={handleClearText}
            className="h-[36px] border-black border w-[36px] flex justify-center items-center text-red-400 hover:text-red-600"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <div className="mx-auto border-black border h-[36px] w-[36px] flex justify-center items-center text-blue-400 cursor-pointer">
          <SearchIcon className="h-5 w-5" />
        </div>
      </form>

      {/* Live Search Preview */}
      {local && (
        <div className="relative w-full sm:max-w-[550px] max-w-[420px]">
          <SearchedPreview value={local} genre={genre} />
        </div>
      )}
    </section>
  );
}

export default SearchBar;
