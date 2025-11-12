import { useState } from "react";
export function ConvertStringToDate(dateStr) {
  if (!dateStr) return "-";

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    const cleanStr = dateStr.split("T")[0] || dateStr.split(" ")[0];
    return cleanStr === "0001-01-01" ? "-" : cleanStr || "-";
  }

  const formatted = date.toISOString().split("T")[0];
  return formatted === "0001-01-01" ? "-" : formatted;
}


export const getDueDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0]; // format: YYYY-MM-DD
};

export function Avatar({ name }) {
  const initials = name
    ? name
        .split(" ")
        .map((x) => x[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";
  return (
    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold">
      {initials}
    </div>
  );
}

export function StarDisplay({ rating }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  return (
    <div className="flex items-center gap-0.5 text-sm">
      {stars.map((s) => (
        <svg
          key={s}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={s <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          className="inline-block"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.17c.969 0 1.371 1.24.588 1.81l-3.374 2.455a1 1 0 00-.364 1.118l1.286 3.966c.3.921-.755 1.688-1.54 1.118L12 17.77l-3.374 2.455c-.784.57-1.84-.197-1.54-1.118l1.286-3.966a1 1 0 00-.364-1.118L4.634 9.393c-.783-.57-.38-1.81.588-1.81h4.17a1 1 0 00.95-.69L11.05 2.927z"
          />
        </svg>
      ))}
    </div>
  );
}

export function StarRating({ rating, setRating }) {
  const [hover, setHover] = useState(0);
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-1"
        aria-label={`Rating ${rating} of 5`}
      >
        {stars.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setRating(s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className="p-1 rounded hover:bg-gray-100 focus:outline-none"
            aria-pressed={s <= rating}
            title={`${s} star${s > 1 ? "s" : ""}`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill={(hover || rating) >= s ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.17c.969 0 1.371 1.24.588 1.81l-3.374 2.455a1 1 0 00-.364 1.118l1.286 3.966c.3.921-.755 1.688-1.54 1.118L12 17.77l-3.374 2.455c-.784.57-1.84-.197-1.54-1.118l1.286-3.966a1 1 0 00-.364-1.118L4.634 9.393c-.783-.57-.38-1.81.588-1.81h4.17a1 1 0 00.95-.69L11.05 2.927z"
              />
            </svg>
          </button>
        ))}
      </div>
      <div className="text-sm text-muted-foreground">
        {rating ? `${rating}/5` : "No rating"}
      </div>
    </div>
  );
}
