import React from "react";

interface ComingSoonCardProps {
  title?: string;
  description?: string;
  badgeText?: string;
  etaText?: string;
}

export default function ComingSoonCard({
  title = "Module Under Development",
  description = "We are building something exciting for this section. Check back soon for new features and updates.",
  badgeText = "Coming Soon",
  etaText = "Estimated Release: Upcoming Build",
}: ComingSoonCardProps) {
  return (
    <main className="w-full flex items-center justify-center p-4">
      {/* Centered Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl text-center overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-32 w-32 rounded-full bg-green-100 blur-2xl opacity-70" />

        <div className="relative z-10 flex flex-col items-center">
          {/* Animated Status Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3.5 py-1 text-xs font-semibold text-green-800">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
            </span>
            {badgeText}
          </div>

          {/* Feature Icon */}
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700 shadow-inner">
            <svg
              className="h-7 w-7"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.75"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.099 2.164-.544 3.125"
              />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl">
            {title}
          </h2>

          {/* Description */}
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            {description}
          </p>

          {/* Release / ETA info */}
          <div className="mt-6 w-full rounded-lg bg-zinc-50 px-4 py-2.5 text-xs font-medium text-zinc-600 border border-zinc-100">
            {etaText}
          </div>
        </div>
      </div>
    </main>
  );
}