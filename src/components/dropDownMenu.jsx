import { MoreVertical } from "lucide-react";
import { useState } from "react";

export default function ReviewOptions({ onDelete }) {
  const [open, setOpen] = useState(false);

  const handleDropDownOpen = () => setOpen((prev) => !prev);

  return (
    <div className="relative inline-block text-left">
      <button onClick={handleDropDownOpen} className="cursor-pointer p-2">
        <MoreVertical className="w-5 h-5 text-gray-600" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg">
          <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 hover:rounded-lg">
            Edit
          </button>
          <button
            onClick={() => {
              onDelete();  // call parent delete
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 hover:rounded-lg text-red-500"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
