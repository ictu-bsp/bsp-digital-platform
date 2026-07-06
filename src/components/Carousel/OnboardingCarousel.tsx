"use client";

import { useState, useEffect } from "react";
import { CarouselIndicator } from "./CarouselIndicator";
import { OnboardingSlide } from "./OnboardingSlide";

const slides = [
  {
    title: "Secure Registration",
    description: "Create your membership profile and verify your identity in minutes.",
    badge: "Step 1",
    accentClassName: "from-emerald-100 to-lime-100",
    /*
     * TODO: Later, connect this slide to admin-managed content and allow an image/icon field.
     * Example: imageUrl?: string; icon?: React.ReactNode; mediaType?: "image" | "icon";
     */
  },
  {
    title: "Track Your Progress",
    description: "Stay updated with your application status and next steps.",
    badge: "Step 2",
    accentClassName: "from-blue-100 to-cyan-100",
  },
  {
    title: "Join the Community",
    description: "Access scouting resources and connect with your local group.",
    badge: "Step 3",
    accentClassName: "from-amber-100 to-orange-100",
  },
];

export function OnboardingCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 3000); // 3000ms = 3 seconds per slide

    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <OnboardingSlide
        title={slides[activeIndex].title}
        description={slides[activeIndex].description}
        badge={slides[activeIndex].badge}
        accentClassName={slides[activeIndex].accentClassName}
      />

      <div className="flex items-center gap-2">
        {slides.map((_, index) => (
          <CarouselIndicator
            key={index}
            active={index === activeIndex}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
