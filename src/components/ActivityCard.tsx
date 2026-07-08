import { CalendarDaysIcon, MapPinIcon } from '@heroicons/react/24/outline';
import type { ActivityCardProps } from '@/types/activities';

export default function ActivityCard({ activity }: ActivityCardProps) {
  const isTailwindClass = !activity.thumbnailColor.startsWith('#');
  const thumbnailStyle = isTailwindClass ? undefined : { backgroundColor: activity.thumbnailColor };

  return (
    <article className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <h3 className="text-[0.95rem] font-semibold text-slate-900">{activity.title}</h3>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            <CalendarDaysIcon className="h-3.5 w-3.5" />
            {activity.startDate} - {activity.endDate}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            <MapPinIcon className="h-3.5 w-3.5" />
            {activity.location}
          </span>
        </div>
      </div>

      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl">
        <div
          className={`absolute inset-0 ${activity.thumbnailColor}`}
          style={thumbnailStyle}
        />
      </div>
    </article>
  );
}
