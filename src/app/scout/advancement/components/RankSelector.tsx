"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock } from "lucide-react";
import MeritBadgeList from "./MeritBadgeList";

type RankOption = {
  key: string;
  title: string;
  image: string;
  unlocked: boolean;
  meritBadges: Array<{ title: string; completed: boolean; note: string }>;
  requirements: Array<{ title: string; completed: boolean }>;
};

const rankOptions: RankOption[] = [
  {
    key: "senior",
    title: "Senior Scout",
    image: "/seniorscout.svg",
    unlocked: true,
    meritBadges: [
      { title: "First Aid", completed: true, note: "Completed and ready for review" },
      { title: "Cooking", completed: true, note: "Completed and ready for review" },
      { title: "Camping", completed: false, note: "Pending requirement" },
    ],
    requirements: [
      { title: "Complete service project planning", completed: true },
      { title: "Submit leadership logbook", completed: true },
      { title: "Attend a weekend campout", completed: false },
    ],
  },
  {
    key: "explorer",
    title: "Explorer",
    image: "/Explorer.svg",
    unlocked: true,
    meritBadges: [
      { title: "Hiking", completed: false, note: "Pending requirement" },
      { title: "Swimming", completed: true, note: "Completed and ready for review" },
      { title: "Personal Fitness", completed: false, note: "Pending requirement" },
    ],
    requirements: [
      { title: "Finish a 10-mile hike", completed: false },
      { title: "Demonstrate outdoor cooking skills", completed: true },
      { title: "Complete one service project", completed: false },
    ],
  },
  {
    key: "pathfinder",
    title: "Pathfinder",
    image: "/Pathfinder.svg",
    unlocked: false,
    meritBadges: [
      { title: "Nature", completed: false, note: "Locked until the previous rank is complete" },
      { title: "Archery", completed: false, note: "Locked until the previous rank is complete" },
      { title: "Citizenship in the Community", completed: false, note: "Locked until the previous rank is complete" },
    ],
    requirements: [
      { title: "Finish the required camping checklist", completed: false },
      { title: "Attend the patrol meeting", completed: false },
      { title: "Complete the leadership challenge", completed: false },
    ],
  },
  {
    key: "outdoorsman",
    title: "Outdoorsman",
    image: "/Outdoorsman.svg",
    unlocked: false,
    meritBadges: [
      { title: "Wood Carving", completed: false, note: "Locked until the previous rank is complete" },
      { title: "Sustainability", completed: false, note: "Locked until the previous rank is complete" },
      { title: "Emergency Preparedness", completed: false, note: "Locked until the previous rank is complete" },
    ],
    requirements: [
      { title: "Complete the outdoor skill assessment", completed: false },
      { title: "Log two community service hours", completed: false },
      { title: "Participate in a troop hike", completed: false },
    ],
  },
  {
    key: "venturer",
    title: "Venturer",
    image: "/Venturer.svg",
    unlocked: false,
    meritBadges: [
      { title: "Oceanography", completed: false, note: "Locked until the previous rank is complete" },
      { title: "Radio", completed: false, note: "Locked until the previous rank is complete" },
      { title: "Science", completed: false, note: "Locked until the previous rank is complete" },
    ],
    requirements: [
      { title: "Lead a small crew activity", completed: false },
      { title: "Complete a camp planning worksheet", completed: false },
      { title: "Present a short project update", completed: false },
    ],
  },
  {
    key: "eagle",
    title: "Eagle Scout",
    image: "/EagleScout.svg",
    unlocked: false,
    meritBadges: [
      { title: "Citizenship in the Nation", completed: false, note: "Locked until the previous rank is complete" },
      { title: "Lifesaving", completed: false, note: "Locked until the previous rank is complete" },
      { title: "Personal Management", completed: false, note: "Locked until the previous rank is complete" },
    ],
    requirements: [
      { title: "Finish the final leadership review", completed: false },
      { title: "Submit the final service project report", completed: false },
      { title: "Complete the board of review checklist", completed: false },
    ],
  },
];

export default function RankSelector() {
  const [selectedRank, setSelectedRank] = useState(rankOptions[0].key);

  const selectedOption = rankOptions.find((rank) => rank.key === selectedRank) ?? rankOptions[0];
  const currentIndex = rankOptions.findIndex((rank) => rank.key === selectedRank);
  const nextRank = rankOptions[Math.min(currentIndex + 1, rankOptions.length - 1)];
  const previousRank = rankOptions[Math.max(currentIndex - 1, 0)];

  const goToRank = (rankKey: string) => {
    const target = rankOptions.find((rank) => rank.key === rankKey);
    if (target?.unlocked) {
      setSelectedRank(rankKey);
    }
  };

  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-[#f8f8f8] p-4 shadow-sm sm:p-5">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Advancement</p>
        <p className="mt-2 text-2xl font-bold text-emerald-950">Progressive ranks</p>
      </div>

      <div className="mt-4 rounded-[1.75rem] border border-emerald-100 bg-white/90 p-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => goToRank(previousRank.key)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm"
            aria-label={`Go to ${previousRank.title}`}
          >
            <span className="text-xl font-semibold">←</span>
          </button>

          <div className="mx-2 flex-1 rounded-[1.5rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 text-center shadow-sm">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.25rem] bg-white p-3 shadow-md">
                <Image src={selectedOption.image} alt={selectedOption.title} width={72} height={72} className="h-16 w-16 object-contain" />
              </div>
            </div>

            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-700">
              {selectedOption.unlocked ? "Current rank" : "Locked rank"}
            </p>
            <p className="mt-1 text-xl font-bold text-emerald-950">{selectedOption.title}</p>
            <p className="mt-2 text-sm text-slate-600">
              {selectedOption.unlocked ? "Ready to review achievements and tasks." : "Complete the previous rank to unlock this stage."}
            </p>

            <div className="mt-3 flex items-center justify-center gap-2">
              {selectedOption.unlocked ? (
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
            onClick={() => goToRank(nextRank.key)}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm"
            aria-label={`Go to ${nextRank.title}`}
          >
            <span className="text-xl font-semibold">→</span>
          </button>
        </div>
      </div>

      <div className="mt-4">
        <MeritBadgeList rank={selectedOption} />
      </div>
    </section>
  );
}
