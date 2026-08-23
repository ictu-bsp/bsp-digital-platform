// src/app/scout/jamboree/one-mindanao/components/OneMindanaoClient.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LockClosedIcon,
  CheckBadgeIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import MeritBadgeCertificateModal, {
  type memberData,
} from "./MeritBadgeCertificateModal";

export interface MeritBadgeItem {
  id: string;
  name: string;
  category: "Core" | "Specialized" | "Outdoor" | "Citizenship";
  imageUrl: string;
  isObtained: boolean;
  dateCompleted?: string;
  evaluatorName?: string;
  requirementsSummary: string;
}

const INITIAL_BADGES: MeritBadgeItem[] = Array.from(
  { length: 40 },
  (_, idx) => {
    const badgeNumber = idx + 1;
    const isSampleUnlocked = idx < 5;
    return {
      id: `mb-${badgeNumber}`,
      name: getBadgeName(badgeNumber),
      category: getBadgeCategory(badgeNumber),
      imageUrl: `/badges/badge-${badgeNumber}.png`,
      isObtained: isSampleUnlocked,
      dateCompleted: isSampleUnlocked ? "Oct 24, 2026" : undefined,
      evaluatorName: isSampleUnlocked ? "Scout Leader Juan Cruz" : undefined,
      requirementsSummary:
        "Demonstrate practical knowledge, pass field skill tests, and fulfill all advancement requirements.",
    };
  },
);

function getBadgeName(idx: number): string {
  const names = [
    "First Aid",
    "Camping",
    "Cooking",
    "Swimming",
    "Pioneering",
    "Citizenship in Community",
    "Citizenship in Nation",
    "Environmental Science",
    "Orienteering",
    "Lifesaving",
    "Communications",
    "Emergency Preparedness",
    "Forestry",
    "Navigation",
    "Weather",
    "Public Health",
    "Safety",
    "Astronomy",
    "Wilderness Survival",
    "Hiking",
    "Fingerprinting",
    "Firemanship",
    "Soil Conservation",
    "Fish and Wildlife",
    "Electronics",
    "Electricity",
    "Carpentry",
    "Leatherwork",
    "Photography",
    "Music",
    "Athletics",
    "Personal Fitness",
    "Bird Study",
    "Geology",
    "Gardening",
    "Search and Rescue",
    "Signaling",
    "Archery",
    "Canoeing",
    "Sustainability",
  ];
  return names[idx - 1] || `Merit Badge #${idx}`;
}

function getBadgeCategory(
  idx: number,
): "Core" | "Specialized" | "Outdoor" | "Citizenship" {
  if (idx <= 10) return "Core";
  if (idx <= 20) return "Outdoor";
  if (idx <= 30) return "Citizenship";
  return "Specialized";
}

interface OneMindanaoClientProps {
  member: memberData;
}

export default function OneMindanaoClient({ member }: OneMindanaoClientProps) {
  const [activeTab, setActiveTab] = useState<"jamboree" | "merit-badge">(
    "jamboree",
  );
  const [selectedBadge, setSelectedBadge] = useState<MeritBadgeItem | null>(
    null,
  );
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const completedCount = INITIAL_BADGES.filter((b) => b.isObtained).length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#f7fdf8] to-[#e7f6ea] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        {/* Mobile Header Bar with Back Action */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white/80 px-4 py-3.5 backdrop-blur-md sticky top-0 z-30">
          <Link
            href="/scout"
            className="inline-flex items-center gap-1 rounded-lg p-1 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronLeftIcon className="h-5 w-5 text-emerald-800" />
            <span>Back</span>
          </Link>
          <span className="text-xs font-black uppercase text-emerald-900">
            7th One Mindanao Jamboree
          </span>
          <div className="w-12" /> {/* Spacer for symmetry */}
        </div>

        {/* Mobile Scrollable Viewport */}
        <div className="flex-1 pb-24 px-4 pt-4 space-y-4">
          {/* Top Event Banner Card */}
          <div className="relative overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-emerald-900 via-green-800 to-emerald-950 p-5 text-white shadow-md">
            <div className="relative z-10 space-y-2">
              <span className="inline-block rounded-full bg-emerald-700/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                Official Jamboree
              </span>
              <h1 className="text-xl font-black leading-tight text-white">
                7th One Mindanao Scout Jamboree
              </h1>
              <p className="text-xs text-emerald-200 leading-relaxed">
                Take part in the 40 National Merit Badge Challenge, unlock
                badges, and download certificates!
              </p>

              {/* Badges Progress Counter Box */}
              <div className="mt-3 flex items-center justify-between rounded-xl bg-white/10 p-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-xs font-black text-emerald-950">
                    {completedCount}
                  </div>
                  <div className="text-[11px] leading-tight">
                    <p className="font-bold text-white">Badges Earned</p>
                    <p className="text-emerald-200 text-[10px]">
                      {40 - completedCount} badges remaining
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-300">
                  {Math.round((completedCount / 40) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Segmented Mobile Tab Switcher */}
          <div className="grid grid-cols-2 rounded-2xl bg-slate-200/70 p-1 text-xs font-bold text-slate-600">
            <button
              onClick={() => setActiveTab("jamboree")}
              className={`rounded-xl py-2.5 transition-all ${
                activeTab === "jamboree"
                  ? "bg-white text-emerald-900 shadow-sm font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              Jamboree Info
            </button>
            <button
              onClick={() => setActiveTab("merit-badge")}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 transition-all ${
                activeTab === "merit-badge"
                  ? "bg-white text-emerald-900 shadow-sm font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              Badges
            </button>
          </div>

          {/* TAB 1: JAMBOREE DETAILS */}
          {activeTab === "jamboree" && (
            <div className="space-y-3.5">
              <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Event Overview
                </h2>
                <div className="flex flex-col gap-2 text-xs font-medium text-slate-600">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5">
                    <CalendarDaysIcon className="h-4 w-4 text-emerald-700 flex-shrink-0" />{" "}
                    October 22 - 27, 2026
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5">
                    <MapPinIcon className="h-4 w-4 text-emerald-700 flex-shrink-0" />{" "}
                    Mindanao Regional Camp Site
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">
                  Join thousands of scouts across Mindanao for brotherhood,
                  outdoor survival, pioneering, and official advancement
                  validations.
                </p>
              </div>

              {/* Module Cards styled like ActivityCard */}
              <div className="space-y-2.5">
                <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-xs font-bold text-emerald-900">
                    Module 1: High Adventure
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                    Obstacle courses, survival shelters, orienteering trails,
                    and rope towers.
                  </p>
                </div>
                <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-xs font-bold text-emerald-900">
                    Module 2: Emergency Response
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                    First aid simulations, mass disaster drills, and water
                    rescue exercises.
                  </p>
                </div>
                <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-xs font-bold text-emerald-900">
                    Module 3: STEM & Crafts
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                    Electronics, sustainable forestry, digital scout navigation
                    tools, and weather tracking.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 40 MERIT BADGES GRID */}
          {activeTab === "merit-badge" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold text-slate-900">
                  Challenge Badges
                </h2>
                <span className="text-[11px] font-semibold text-emerald-800">
                  {completedCount} of 40 Completed
                </span>
              </div>

              {/* 4-column compact touch grid for mobile devices */}
              <div className="grid grid-cols-4 gap-2.5">
                {INITIAL_BADGES.map((badge, index) => (
                  <button
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`flex flex-col items-center justify-between rounded-2xl border p-2 text-center transition-all ${
                      badge.isObtained
                        ? "border-emerald-200 bg-white shadow-sm active:scale-95"
                        : "border-slate-200 bg-slate-100/70 opacity-80"
                    }`}
                  >
                    <span className="text-[9px] font-black text-slate-400 self-start">
                      #{index + 1}
                    </span>

                    {/* Badge Icon Slot */}
                    <div className="my-1 flex h-10 w-10 items-center justify-center">
                      {badge.isObtained ? (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-400 bg-amber-50">
                          <CheckBadgeIcon className="h-6 w-6 text-emerald-700" />
                        </div>
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-200 text-slate-400">
                          <LockClosedIcon className="h-4 w-4" />
                        </div>
                      )}
                    </div>

                    <p className="line-clamp-2 h-7 text-[10px] font-semibold leading-tight text-slate-800">
                      {badge.isObtained ? badge.name : "Locked"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal: Badge Details for Mobile */}
        {selectedBadge && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Badge Info • {selectedBadge.category}
                </span>
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="rounded-full bg-slate-100 p-1 text-slate-400 hover:bg-slate-200"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-slate-100 bg-slate-50 shadow-inner">
                  {selectedBadge.isObtained ? (
                    <CheckBadgeIcon className="h-12 w-12 text-emerald-700" />
                  ) : (
                    <LockClosedIcon className="h-8 w-8 text-slate-400" />
                  )}
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900">
                  {selectedBadge.isObtained
                    ? selectedBadge.name
                    : "Locked Merit Badge"}
                </h3>

                <div className="mt-3 space-y-1.5 rounded-xl border border-slate-100 bg-slate-50 p-3 text-left text-[11px] text-slate-600">
                  <p>
                    <strong className="text-slate-800">Status: </strong>
                    {selectedBadge.isObtained ? (
                      <span className="font-bold text-emerald-700">
                        Verified & Earned
                      </span>
                    ) : (
                      <span className="font-bold text-amber-700">
                        Not Completed
                      </span>
                    )}
                  </p>
                  {selectedBadge.isObtained && (
                    <>
                      <p>
                        <strong className="text-slate-800">Completed:</strong>{" "}
                        {selectedBadge.dateCompleted}
                      </p>
                      <p>
                        <strong className="text-slate-800">Evaluator:</strong>{" "}
                        {selectedBadge.evaluatorName}
                      </p>
                    </>
                  )}
                  <p>
                    <strong className="text-slate-800">Requirements:</strong>{" "}
                    {selectedBadge.requirementsSummary}
                  </p>
                </div>
              </div>

              <div>
                {selectedBadge.isObtained ? (
                  <button
                    onClick={() => setIsCertModalOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-900 active:scale-[0.99]"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Download Certificate of Achievement
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full cursor-not-allowed rounded-xl bg-slate-200 py-3 text-[11px] font-bold text-slate-400"
                  >
                    Complete Badge to Unlock Certificate
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Certificate Modal */}
        {selectedBadge && (
          <MeritBadgeCertificateModal
            isOpen={isCertModalOpen}
            onClose={() => setIsCertModalOpen(false)}
            badge={selectedBadge}
            member={member}
          />
        )}
      </div>
      
    </main>
    
  );
}
