"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import BookCard from "./bookCard";

export default function BookSliderByGenre({ books = [] }) {
  if (!books || books.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden mt-5">
      <Swiper
        slidesPerView={2} // default for smallest screens
        spaceBetween={20} // gap between cards
        breakpoints={{
          640: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 25,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 30,
          },
          1280: {
            slidesPerView: 5,
            spaceBetween: 35,
          },
        }}
        pagination={{ clickable: true }}
        className="h-full"
      >
        {books.map((b) => (
          <SwiperSlide key={b.id} className="relative">
            <BookCard book={b} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
