'use client';

import { useState } from 'react';
import ActivityList from '../components/ActivityList';
import BottomNav from '../../components/BottomNav';
import FeaturedCarousel from '../../components/FeaturedCarousel';
import FilterTabs from '../components/FilterTabs';
import Header from '../../components/Header';
import type { Activity, FeaturedBanner } from '@/types/activities';

interface ScoutingActivitiesScreenProps {
  userName: string;
  avatarUrl?: string;
  banners: FeaturedBanner[];
  activities: Activity[];
}

export default function ScoutingActivitiesScreen({
  userName,
  avatarUrl,
  banners,
  activities,
}: ScoutingActivitiesScreenProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <Header userName={userName} avatarUrl={avatarUrl} />
        </div>

        <div className="flex-1 overflow-y-auto pb-28">
          <div className="space-y-5 px-4 py-5">
            <div className="space-y-1">
              <h1 className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Scouting Activities</h1>
            </div>

            <FeaturedCarousel banners={banners} />
            <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            <ActivityList activities={activities} activeFilter={activeFilter} />
          </div>
        </div>

        <BottomNav />
      </div>
    </main>
  );
}
