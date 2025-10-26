"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import Link from "next/link";

export default function BannerSlider({ bannerBooks = [] }) {
  // Slice once and reuse
  const books = bannerBooks.slice(0, 5);
  const hasMultipleSlides = books.length > 1;
  if (!books || books.length === 0) return null;

  return (
    <section className="relative w-full h-[40vh] sm:h-[60vh] overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        slidesPerView={1}
        loop={hasMultipleSlides}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1000}
        autoplay={
          hasMultipleSlides
            ? {
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : undefined
        }
        pagination={{ clickable: true }}
        allowTouchMove={hasMultipleSlides}
        className="h-full"
      >
        {books?.map((b) => (
          <SwiperSlide key={b.id} className="relative">
            {/* Background image */}
            <img
              src={b.image_url}
              alt={b.title}
              className="absolute inset-0 h-full mx-auto brightness-75"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

            {/* Content */}
            <div className="relative z-10 h-full flex items-end px-6 md:px-16 pb-8 sm:pb-10">
              <div className="max-w-3xl text-white space-y-2 sm:space-y-4 animate-fade-in">
                <h1 className="sm:text-3xl text-xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  {b.title}
                </h1>
                <p className="text-sm md:text-2xl font-medium opacity-90 pb-2">
                  by {b.author}
                </p>
                <Link
                  href={`/book/${b.id}`}
                  className="sm:mt-6 mt-2 cursor-pointer bg-white text-black sm:px-6 px-3 sm:py-3 py-2 font-semibold hover:bg-gray-100 transition-all duration-300"
                >
                  Read More
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        :global(.swiper-pagination-bullet) {
          background: white;
          opacity: 0.7;
        }
        :global(.swiper-pagination-bullet-active) {
          background: white;
          opacity: 1;
        }
      `}</style>
    </section>
  );
}
