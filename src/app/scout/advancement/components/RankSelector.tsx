"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock } from "lucide-react";

const rankOptions = [
  { key: "senior", title: "Senior Scout", image: "/seniorscout.svg", unlocked: true },
  { key: "explorer", title: "Explorer", image: "/Explorer.svg", unlocked: true },
  { key: "pathfinder", title: "Pathfinder", image: "/Pathfinder.svg", unlocked: false },
  { key: "outdoorsman", title: "Outdoorsman", image: "/Outdoorsman.svg", unlocked: false },
  { key: "venturer", title: "Venturer", image: "/Venturer.svg", unlocked: false },
  { key: "eagle", title: "Eagle Scout", image: "/EagleScout.svg", unlocked: false },
];

export default function RankSelector() {
  const [selectedRank, setSelectedRank] = useState(rankOptions[0].key);

  const selectedOption = rankOptions.find((rank) => rank.key === selectedRank) ?? rankOptions[0];

  return (
    <section className="rounded-[2rem] border border-emerald-100 bg-[#f8f8f8] p-4 shadow-sm sm:p-5">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
          Advancement
        </p>
        <p className="mt-2 text-2xl font-bold text-emerald-950">Progressive ranks</p>
      </div>

      <div className="mt-4 space-y-2">
        {rankOptions.map((rank) => {
          const isActive = selectedRank === rank.key;
          const isUnlocked = rank.unlocked;

          return (
            <button
              key={rank.key}
              type="button"
              onClick={() => isUnlocked && setSelectedRank(rank.key)}
              disabled={!isUnlocked}
              className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                isActive
                  ? "border-emerald-700 bg-emerald-50 shadow-sm"
                  : isUnlocked
                    ? "border-gray-200 bg-white"
                    : "border-gray-200 bg-gray-100 opacity-80"
              }`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-sm">
                <Image src={rank.image} alt={rank.title} width={36} height={36} className="h-8 w-8 object-contain" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-semibold ${isActive ? "text-emerald-900" : "text-slate-800"}`}>
                    {rank.title}
                  </p>
                  {isUnlocked ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                      Unlocked
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-gray-200 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
                      <Lock className="h-3 w-3" /> Locked
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {isUnlocked ? "Tap to switch to this rank" : "Complete the previous rank to unlock"}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-100 bg-white/80 p-3 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-700">
          Current selection
        </p>
        <p className="mt-1 text-lg font-semibold text-emerald-950">{selectedOption.title}</p>
      </div>
    </section>
  );
}
