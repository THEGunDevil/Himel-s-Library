"use client"
import UpdateBook from "@/components/updateBook";
import { useParams } from "next/navigation";
import React from "react";

function UpdateBookPage() {
  const { id } = useParams();
  return (
    <section className="pt-24 md:pt-32 xl:px-20 lg:px-20 px-4">
      <UpdateBook updateBookID={id} />
    </section>
  );
}

export default UpdateBookPage;
