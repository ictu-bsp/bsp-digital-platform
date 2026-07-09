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
    { id: 'blank-0', bgClass: 'bg-emerald-200', dotClass: 'bg-emerald-700' },
    { id: 'blank-1', bgClass: 'bg-blue-200', dotClass: 'bg-blue-700' },
    { id: 'blank-2', bgClass: 'bg-amber-200', dotClass: 'bg-amber-700' },
    { id: 'blank-3', bgClass: 'bg-rose-200', dotClass: 'bg-rose-700' },
    { id: 'blank-4', bgClass: 'bg-violet-200', dotClass: 'bg-violet-700' },
    { id: 'blank-5', bgClass: 'bg-sky-200', dotClass: 'bg-sky-700' },
    { id: 'blank-6', bgClass: 'bg-lime-200', dotClass: 'bg-lime-700' },
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
