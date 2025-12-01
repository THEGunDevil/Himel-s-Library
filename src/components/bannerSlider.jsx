"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import Link from "next/link";
import Image from "next/image";

export default function BannerSlider({ bannerBooks = [] }) {
  const books = bannerBooks.slice(0, 5);
  if (books.length === 0) return null;

  const hasMultipleSlides = books.length > 1;

  return (
    <section className="relative w-full h-[40vh] sm:h-[60vh] overflow-hidden">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        slidesPerView={1}
        loop={hasMultipleSlides}
        effect="fade"
        speed={1000}
        fadeEffect={{ crossFade: true }}
        autoplay={
          hasMultipleSlides
            ? { delay: 4000, disableOnInteraction: false }
            : false
        }
        pagination={{ clickable: true }}
        allowTouchMove={hasMultipleSlides}
        className="h-full"
      >
        {books.map((b, index) => (
          <SwiperSlide key={b.id} className="relative h-full">
            
            {/* Optimized Image Lazy Load */}
            <Image
              src={b.image_url}
              alt={b.title}
              fill
              className="object-contain brightness-100 dark:bg-gray-400"
              priority={index === 0}   // Only FIRST slide loads immediately
              loading={index === 0 ? "eager" : "lazy"}   // Others lazy-load
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/40  to-transparent"></div>

            {/* Text */}
            <div className="relative z-10 h-full flex items-end px-6 md:px-16 pb-8 md:pb-10">
              <div className="text-white max-w-3xl space-y-2 md:space-y-3 animate-fade-in">
                <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  {b.title}
                </h1>

                <p className="text-sm md:text-lg lg:text-xl opacity-90">
                  by {b.author}
                </p>

                <Link
                  href={`/book/${b.id}`}
                  className="inline-block mt-4 bg-white text-black px-2 sm:px-6 py-1.5 sm:py-3 font-semibold rounded hover:bg-gray-100 transition"
                >
                  Read More
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

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
          background: white !important;
          opacity: 0.6;
        }

        :global(.swiper-pagination-bullet-active) {
          background: white !important;
          opacity: 1;
        }
      `}</style>
    </section>
  );
}
