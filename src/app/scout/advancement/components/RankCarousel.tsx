"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import BadgeTimeline, { MeritBadgeItem } from "./BadgeTimeline";

export interface RankItem {
  id: string;
  name: string;
  imageSrc: string;
  badgeType: string;
  unlocked?: boolean;
}

interface RankCarouselProps {
  ranks: RankItem[];
  activeRankId: string;
}

export default function RankCarousel({ ranks, activeRankId }: RankCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, ranks.findIndex((rank) => rank.id === activeRankId)));

  useEffect(() => {
    const nextIndex = Math.max(0, ranks.findIndex((rank) => rank.id === activeRankId));
    setActiveIndex(nextIndex);
  }, [activeRankId, ranks]);

  const activeRank = ranks[activeIndex] ?? ranks[0];
  const previousRank = ranks[Math.max(0, activeIndex - 1)];
  const nextRank = ranks[Math.min(ranks.length - 1, activeIndex + 1)];

  const pagination = useMemo(() => ranks.map((_, index) => index), [ranks]);

  const rankBadges: Record<string, MeritBadgeItem[]> = {
    senior: [
      { id: "senior-1", name: "First Aid", isCompleted: true, note: "Completed and ready for review" },
      { id: "senior-2", name: "Cooking", isCompleted: true, note: "Completed and ready for review" },
      { id: "senior-3", name: "Camping", isCompleted: true, note: "Completed and ready for review" },
      { id: "senior-4", name: "Swimming", isCompleted: true, note: "Completed and ready for review" },
    ],
    explorer: [
      { id: "explorer-1", name: "Swimming", isCompleted: true, note: "Completed and ready for review" },
      { id: "explorer-2", name: "Personal Fitness", isCompleted: false, note: "Pending requirement" },
      { id: "explorer-3", name: "Hiking", isCompleted: false, note: "Available to acquire when you go to the next rank" },
      { id: "explorer-4", name: "Community Service", isCompleted: false, note: "Required before the next rank unlocks" },
    ],
    pathfinder: [
      { id: "pathfinder-1", name: "Nature", isCompleted: false, note: "Available to acquire when you go to the next rank" },
      { id: "pathfinder-2", name: "Archery", isCompleted: false, note: "Pending requirement" },
      { id: "pathfinder-3", name: "Citizenship in the Community", isCompleted: false, note: "Available to acquire when you go to the next rank" },
      { id: "pathfinder-4", name: "Patrol Leadership", isCompleted: false, note: "Required to unlock the next stage" },
    ],
    outdoorsman: [
      { id: "outdoorsman-1", name: "Wood Carving", isCompleted: false, note: "Available to acquire when you go to the next rank" },
      { id: "outdoorsman-2", name: "Sustainability", isCompleted: false, note: "Required progress task" },
      { id: "outdoorsman-3", name: "Emergency Preparedness", isCompleted: false, note: "Pending requirement" },
      { id: "outdoorsman-4", name: "Camping Adventure", isCompleted: false, note: "Available to acquire when you go to the next rank" },
    ],
    venturer: [
      { id: "venturer-1", name: "Oceanography", isCompleted: false, note: "Available to acquire when you go to the next rank" },
      { id: "venturer-2", name: "Radio", isCompleted: false, note: "Pending requirement" },
      { id: "venturer-3", name: "Science", isCompleted: false, note: "Available to acquire when you go to the next rank" },
      { id: "venturer-4", name: "Crew Planning", isCompleted: false, note: "Required before the next rank unlocks" },
    ],
    eagle: [
      { id: "eagle-1", name: "Leadership Project", isCompleted: false, note: "Locked until the previous rank is complete" },
      { id: "eagle-2", name: "Service Hours", isCompleted: false, note: "Locked until the previous rank is complete" },
      { id: "eagle-3", name: "Board Review", isCompleted: false, note: "Locked until the previous rank is complete" },
      { id: "eagle-4", name: "Final Scout Review", isCompleted: false, note: "Locked until the previous rank is complete" },
    ],
  };

  const currentBadges = rankBadges[activeRank?.id ?? "explorer"] ?? rankBadges.explorer;

  const handleShift = (direction: "prev" | "next") => {
    if (direction === "prev" && activeIndex > 0) {
      setActiveIndex((value) => value - 1);
      return;
    }

    if (direction === "next" && activeIndex < ranks.length - 1) {
      setActiveIndex((value) => value + 1);
    }
  };

  return (
    <section className="rounded-[1.75rem] border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-700">Current rank</p>
          <p className="mt-1 text-lg font-bold text-emerald-950">{activeRank?.name}</p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {activeRank?.badgeType}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleShift("prev")}
          disabled={activeIndex === 0}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Show previous rank"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex-1 rounded-[1.5rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-4 text-center shadow-sm">
          <div className="flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-[1.4rem] bg-white p-3 shadow-md">
              <Image src={activeRank.imageSrc} alt={activeRank.name} width={84} height={84} className="h-16 w-16 object-contain" />
            </div>
          </div>

          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-700">Progression</p>
          <p className="mt-1 text-xl font-bold text-emerald-950">{activeRank.name}</p>
          <p className="mt-2 text-sm text-slate-600">
            {activeRank.unlocked !== false ? "This rank is unlocked and ready to review." : "Complete the previous rank to unlock this stage."}
          </p>

          <div className="mt-3 flex items-center justify-center gap-2">
            {activeRank.unlocked !== false ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Unlocked
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                <Lock className="h-3 w-3" /> Locked
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleShift("next")}
          disabled={activeIndex === ranks.length - 1}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Show next rank"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
        <div className="min-w-0 flex-1 text-left">
          <p className="font-semibold text-slate-700">Previous</p>
          <p className="truncate">{previousRank?.name ?? "—"}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {pagination.map((_, index) => (
            <span
              key={index}
              className={`h-2.5 rounded-full transition ${index === activeIndex ? "w-6 bg-emerald-700" : "w-2.5 bg-emerald-200"}`}
            />
          ))}
        </div>
        <div className="min-w-0 flex-1 text-right">
          <p className="font-semibold text-slate-700">Next</p>
          <p className="truncate">{nextRank?.name ?? "—"}</p>
        </div>
      </div>

      <div className="mt-4">
        <BadgeTimeline badges={currentBadges} />
      </div>
    </section>
  );
}
