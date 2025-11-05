import { MoreVertical } from "lucide-react";
import { useState } from "react";

export default function Options({ onDelete, onEdit, disabled }) {
  const [open, setOpen] = useState(false);

  const handleDropDownOpen = () => setOpen((prev) => !prev);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={handleDropDownOpen}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 sm:opacity-0 sm:group-hover:opacity-100 opacity-100"
        aria-label="Review options"
        disabled={disabled}
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          <button
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:rounded-t-lg disabled:opacity-50 transition-colors duration-200"
            disabled={disabled}
          >
            Edit
          </button>
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 hover:rounded-b-lg disabled:opacity-50 transition-colors duration-200"
            disabled={disabled}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}