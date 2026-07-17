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
      setCurrentIdx((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) {
    return (
      <div className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50 p-6 text-sm text-slate-600">
        Featured activities will appear here.
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="overflow-hidden rounded-[1.75rem] shadow-sm">
        <div className="relative h-44 overflow-hidden sm:h-52">
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentIdx * 100}%)`,
            }}
          >
            {banners.map((banner) => (
              <Link
                key={banner.id}
                href={banner.linkUrl ?? "#"}
                className="relative h-full w-full shrink-0"
              >
                {banner.imageUrl ? (
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-700 to-green-600">
                    <span className="px-6 text-center text-lg font-semibold text-white">
                      {banner.title}
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/25" />

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="text-lg font-bold text-white drop-shadow">
                    {banner.title}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIdx(index)}
            className={`h-2.5 w-2.5 rounded-full transition ${
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