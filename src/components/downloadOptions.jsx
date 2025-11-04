import { DownloadIcon } from "lucide-react";
import { useState } from "react";

export default function DownloadOptions({
  onDownloadPDF,
  onDownloadCSV,
  disabled,
}) {
  const [open, setOpen] = useState(false);

  const handleDropDownOpen = () => setOpen((prev) => !prev);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={handleDropDownOpen}
        className="p-1.5 cursor-pointer bg-white flex justify-center items-center rounded border border-gray-300"
      >
        <DownloadIcon className="h-5 text-blue-600" />
      </button>
      {open && (
        <div className="absolute right-10 top-0 w-32 bg-white border border-gray-400 z-50">
          <button
            onClick={() => {
              onDownloadPDF();
              setOpen(false);
            }}
            className="block w-full cursor-pointer
             text-left px-4 py-2 text-sm hover:bg-gray-50 hover:rounded-t-lg disabled:opacity-50"
            disabled={disabled}
          >
            Download <span className="text-blue-500 font-medium">PDF</span>
          </button>
          <button
            onClick={() => {
              onDownloadCSV();
              setOpen(false);
            }}
            className="block w-full text-left px-4 cursor-pointer py-2 text-sm hover:bg-gray-50 hover:rounded-b-lg disabled:opacity-50"
            disabled={disabled}
          >
            Download <span className="text-blue-500 font-medium">CSV</span>
          </button>
        </div>
      )}
    </div>
  );
}
