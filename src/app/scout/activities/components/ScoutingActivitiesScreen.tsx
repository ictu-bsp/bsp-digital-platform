//src/app/scout/activities/components/ScoutingActivitiesScreen.tsx

"use client";

import { useState } from "react";

import Header from "../../components/Header";
import BottomNav from "../../components/BottomNav";
import FeaturedCarousel from "../../components/FeaturedCarousel";
import FilterTabs from "../components/FilterTabs";
import ActivityList from "../components/ActivityList";

import type {
  Activity,
  ActivityCategory,
  FeaturedBanner,
} from "@/types/activities";

interface ScoutingActivitiesScreenProps {
  userName: string;
  avatarUrl?: string;
  banners: FeaturedBanner[];
  activities: Activity[];
  myActivities: Activity[];
}

export default function ScoutingActivitiesScreen({
  userName,
  avatarUrl,
  banners,
  activities,
  myActivities,
}: ScoutingActivitiesScreenProps) {
  const [activeFilter, setActiveFilter] =
    useState<ActivityCategory | "all">("all");

  const [showMine, setShowMine] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#f7fdf8] to-[#e7f6ea] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">

        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <Header
            userName={userName}
            avatarUrl={avatarUrl}
          />
        </div>

        <div className="flex-1 overflow-y-auto pb-28">
          <div className="space-y-5 px-4 py-5">

            <div className="space-y-1">
              <h1 className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
                Scouting Activities
              </h1>
            </div>

            <FeaturedCarousel banners={banners} />

            {/* All Activities / My Activities */}
            <div className="flex overflow-hidden rounded-xl border border-emerald-700">

              <button
                onClick={() => setShowMine(false)}
                className={`flex-1 py-2 text-sm font-semibold transition ${
                  !showMine
                    ? "bg-emerald-700 text-white"
                    : "bg-white text-emerald-700"
                }`}
              >
                All Activities
              </button>

              <button
                onClick={() => setShowMine(true)}
                className={`flex-1 py-2 text-sm font-semibold transition ${
                  showMine
                    ? "bg-emerald-700 text-white"
                    : "bg-white text-emerald-700"
                }`}
              >
                My Activities
              </button>

            </div>

            <FilterTabs
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            <ActivityList
              activities={
                showMine
                ? myActivities
                : activities
              }
              activeFilter={activeFilter}
              emptyMessage={
                showMine
                ? "You haven't joined any activities yet."
                : "No activities match this filter right now."
              }
            />
          </div>
        </div>
        <BottomNav />
      </div>
    </main>
  );
}