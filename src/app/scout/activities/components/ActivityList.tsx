// src/app/scout/activities/components/ActivityList.tsx

import ActivityCard from "../components/ActivityCard";
import type { ActivityListProps } from "@/types/activities";

export default function ActivityList({
  activities,
  activeFilter,
  emptyMessage = "No activities match this filter right now.",
}: ActivityListProps) {
  const visibleActivities =
    activeFilter === "all"
      ? activities
      : activities.filter(
          (activity) => activity.category === activeFilter
        );

  if (visibleActivities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
        <p className="text-base font-semibold text-slate-700">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-3">
      {visibleActivities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
        />
      ))}
    </section>
  );
}