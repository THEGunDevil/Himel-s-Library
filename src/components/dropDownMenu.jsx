import { MoreVertical } from "lucide-react";
import { useState } from "react";

export default function ReviewOptions({ onDelete, onEdit, disabled }) {
  const [open, setOpen] = useState(false);

  const handleDropDownOpen = () => setOpen((prev) => !prev);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={handleDropDownOpen}
        className="cursor-pointer p-2 sm:opacity-0 sm:group-hover:opacity-100 opacity-100 transition-opacity duration-200"
        aria-label="Review options"
        disabled={disabled}
      >
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {open && (
        <div className="absolute right-8 top-0 w-32 bg-white border z-10">
          <button
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 hover:rounded-t-lg disabled:opacity-50"
            disabled={disabled}
          >
            Edit
          </button>
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 hover:rounded-b-lg text-red-500 disabled:opacity-50"
            disabled={disabled}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}