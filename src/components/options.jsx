import { Edit, Image, MoreVertical, PlusCircle } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Options({
  onDelete,
  onEdit,
  onView,
  type = "edit",
  data,
}) {
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
        {type === "bio" && (
          <DropdownMenuItem onClick={onEdit} className="flex justify-between">
            <span>Add Bio</span>
            <PlusCircle />
          </DropdownMenuItem>
        )}
        {type === "profile_img" && (
          <>
            {!data ? (
              <DropdownMenuItem
                onClick={onEdit}
                className="flex justify-between"
              >
                <span>Add Image</span>
                <PlusCircle />
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={onView} // different handler for viewing
                className="flex justify-between"
              >
                <span>View Image</span>
                <Image />
              </DropdownMenuItem>
            )}
          </>
        )}

        {type === "edit" ||
          (data && (
            <>
              <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                Delete
              </DropdownMenuItem>
            </>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
