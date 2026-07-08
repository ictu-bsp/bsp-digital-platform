import ActivityCard from '@/components/ActivityCard';
import type { ActivityListProps } from '@/types/activities';

export default function ActivityList({ activities, activeFilter }: ActivityListProps) {
  const visibleActivities =
    activeFilter === 'all'
      ? activities
      : activities.filter((activity) => activity.category === activeFilter);

  if (!visibleActivities.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
        No activities match this filter right now.
      </div>
    );
  }

  return (
    <section className="space-y-3">
      {visibleActivities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </section>
  );
}
