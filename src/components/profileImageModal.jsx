import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { XCircleIcon } from "lucide-react";

export default function ProfileImageModal({
  imageSrc,
  openProfileImg,
  setOpenProfileImg,
}) {
  const cardRef = useRef();

  // Close modal if clicked outside the card
  useEffect(() => {
    function handleClickOutside(event) {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setOpenProfileImg(false);
      }
    }

    if (openProfileImg) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openProfileImg, setOpenProfileImg]);

  if (!openProfileImg) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card
        ref={cardRef}
        className="relative w-full max-w-md bg-slate-900 rounded-none border-0"
      >
        <CardContent className="flex w-96 h-96 justify-center">
          <Image src={imageSrc} alt="Profile" fill className="object-contain" />
        </CardContent>
        <button
          className="absolute top-2 right-2 border bg-transparent border-transparent 
             hover:border-white transition-all duration-300 cursor-pointer
             p-1 rounded-full hover:scale-110"
          onClick={() => setOpenProfileImg(false)}
        >
          <XCircleIcon size={22} className="text-slate-300" />
        </button>
      </Card>
    </div>
  );
}
