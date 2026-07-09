"use client";

import { useEffect, useState } from "react";

export interface PromoBanner {
  id: string;
  backgroundColor: string;
  linkUrl: string;
  label: string;
}

interface PromoCarouselProps {
  banners: PromoBanner[];
}

export default function PromoCarousel({ banners }: PromoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!banners.length) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [banners.length]);

  return (
    <section className="space-y-4 px-4">
      <div className="overflow-hidden rounded-[2rem] shadow-sm">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {banners.map((banner) => (
            <a
              key={banner.id}
              href={banner.linkUrl}
              className="min-w-full flex-shrink-0"
              style={{ backgroundColor: banner.backgroundColor }}
            >
              <div className="aspect-[12/7]" />
            </a>
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
              index === activeIndex ? "bg-green-900" : "bg-slate-300"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
