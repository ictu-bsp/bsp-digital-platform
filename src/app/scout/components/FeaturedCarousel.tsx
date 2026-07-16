'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { FeaturedCarouselProps } from '@/types/activities';

export default function FeaturedCarousel({ banners }: FeaturedCarouselProps) {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (!banners.length) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) {
    return (
      <div className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50 p-6 text-sm text-slate-600">
        Featured announcements will appear here.
      </div>
    );
  }

  const slides = [
    { id: 'blank-0', bgClass: 'bg-[linear-gradient(135deg,_#d9f5e6_0%,_#a7f3d0_100%)]', dotClass: 'bg-emerald-700' },
    { id: 'blank-1', bgClass: 'bg-[linear-gradient(135deg,_#ecfdf5_0%,_#bbf7d0_100%)]', dotClass: 'bg-green-700' },
    { id: 'blank-2', bgClass: 'bg-[linear-gradient(135deg,_#f0fdf4_0%,_#86efac_100%)]', dotClass: 'bg-emerald-800' },
    { id: 'blank-3', bgClass: 'bg-[linear-gradient(135deg,_#dcfce7_0%,_#4ade80_100%)]', dotClass: 'bg-green-800' },
    { id: 'blank-4', bgClass: 'bg-[linear-gradient(135deg,_#e6ffef_0%,_#34d399_100%)]', dotClass: 'bg-emerald-900' },
    { id: 'blank-5', bgClass: 'bg-[linear-gradient(135deg,_#f7fee7_0%,_#bef264_100%)]', dotClass: 'bg-lime-700' },
    { id: 'blank-6', bgClass: 'bg-[linear-gradient(135deg,_#eefcf3_0%,_#6ee7b7_100%)]', dotClass: 'bg-teal-700' },
  ];
  const dots = Array.from({ length: 3 }, (_, index) => index);

  return (
    <section className="space-y-3">
      <div className="overflow-hidden rounded-[1.75rem] shadow-sm">
        <div className="relative h-44 overflow-hidden sm:h-52">
          <div
            className="flex h-full w-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIdx * 100}%)` }}
          >
            {slides.map((slide) => (
              <div key={slide.id} className={`h-full w-full shrink-0 ${slide.bgClass}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        {dots.map((dotIndex) => {
          const isActive = dotIndex === currentIdx;

          return (
            <button
              key={dotIndex}
              type="button"
              aria-label={`Show banner ${dotIndex + 1}`}
              className={`h-2.5 w-2.5 rounded-full transition ${
                isActive ? 'bg-emerald-700' : 'bg-slate-300'
              }`}
              onClick={() => setCurrentIdx(dotIndex)}
            />
          );
        })}
      </div>
    </section>
  );
}
