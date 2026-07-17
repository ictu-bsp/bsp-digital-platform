//src/app/scout/components/PromoCarousel.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export interface PromoBanner {
  id: string;
  backgroundColor: string;
  linkUrl: string;
  title: string;
  imageUrl?: string | null;
}

interface PromoCarouselProps {
  banners: PromoBanner[];
}

export default function PromoCarousel({
  banners,
}: PromoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!banners.length) return;

    const interval = window.setInterval(() => {
      setActiveIndex(
        (current) => (current + 1) % banners.length
      );
    }, 4000);

    return () => window.clearInterval(interval);
  }, [banners.length]);

  if (!banners.length) return null;

  return (
    <section className="space-y-4 px-4">
      <div className="overflow-hidden rounded-[2rem] shadow-lg">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(-${activeIndex * 100}%)`,
          }}
        >
          {banners.map((banner) => (
            <Link
              key={banner.id}
              href={banner.linkUrl}
              className="relative min-w-full flex-shrink-0 overflow-hidden"
            >
              <div
                className="relative aspect-[12/7]"
                style={{
                  backgroundColor:
                    banner.backgroundColor,
                }}
              >
                {banner.imageUrl ? (
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="100vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-200">
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
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2">
        {banners.map((banner, index) => (
          <button
            key={banner.id}
            type="button"
            aria-label={`Slide ${index + 1}`}
            onClick={() => setActiveIndex(index)}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              index === activeIndex
                ? "bg-emerald-700"
                : "bg-slate-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
}