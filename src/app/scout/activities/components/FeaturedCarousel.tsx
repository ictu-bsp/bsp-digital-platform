//src/app/scout/activities/components/FeaturedCarousel.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

import type { FeaturedCarouselProps } from "@/types/activities";

export default function FeaturedCarousel({
  banners,
}: FeaturedCarouselProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIdx(
        (prev) => (prev + 1) % banners.length
      );
    }, 4000);

    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-slate-100 p-6 text-center text-sm text-slate-500 shadow-lg">
        Featured activities will appear here.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-[2rem] shadow-lg">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${currentIdx * 100}%)`,
          }}
        >
          {banners.map((banner) => {
            const hasImage =
              typeof banner.imageUrl === "string" &&
              banner.imageUrl.trim().length > 0;

            return (
              <Link
                key={banner.id}
                href={banner.linkUrl ?? "#"}
                className="relative min-w-full flex-shrink-0 overflow-hidden"
              >
                <div
                  className="relative aspect-[12/7]"
                  style={{
                    backgroundColor:
                      banner.backgroundColor ??
                      "#dbe4ef",
                  }}
                >
                  {hasImage ? (
                    <Image
                      src={banner.imageUrl!}
                      alt={banner.title}
                      fill
                      className="object-cover"
                      sizes="100vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-lg font-semibold text-slate-500">
                        No Image
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h2 className="line-clamp-2 text-lg font-bold text-white drop-shadow">
                      {banner.title}
                    </h2>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {banners.map((banner, index) => (
          <button
            key={banner.id}
            type="button"
            aria-label={`Slide ${index + 1}`}
            onClick={() => setCurrentIdx(index)}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              currentIdx === index
                ? "bg-emerald-700"
                : "bg-slate-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
}