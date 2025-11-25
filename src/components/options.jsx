import { Edit, MoreVertical, PlusCircle } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Options({ onDelete, onEdit, type = "edit" }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {type === "edit" ? (
          <Button
            variant={"ghost"}
            className="h-8 w-8 p-0 
     opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <MoreVertical size={20} />
          </Button>
        ) : (
          <button
            className=" 
     opacity-100 text-gray-600 cursor-pointer"
          >
            <Edit size={18} />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(type === "bio" || type === "profile_img") && (
          <>
            <DropdownMenuItem onClick={onEdit} className="flex justify-between">
              <span>Add {type === "bio" ? "Bio" : "Image"}</span>
              <PlusCircle />
            </DropdownMenuItem>
          </>
        )}
        {type === "edit" && (
          <>
            <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
