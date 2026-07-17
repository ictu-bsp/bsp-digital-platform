// src/app/scout/activities/components/ActivityCard.tsx

import Link from "next/link";
import Image from "next/image";
import {
  CalendarDaysIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

import type { ActivityCardProps } from "@/types/activities";

export default function ActivityCard({
  activity,
}: ActivityCardProps) {
  return (
    <Link
      href={`/scout/activities/${activity.id}`}
      className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50"
    >
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[0.95rem] font-semibold text-slate-900">
          {activity.title}
        </h3>

        {activity.description && (
          <p className="mt-2 line-clamp-2 text-sm text-slate-600">
            {activity.description}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            <CalendarDaysIcon className="h-3.5 w-3.5" />
            {activity.startDate}
            {activity.endDate ? ` - ${activity.endDate}` : ""}
          </span>

          {activity.location && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              <MapPinIcon className="h-3.5 w-3.5" />
              {activity.location}
            </span>
          )}
        </div>
      </div>

      {/* Image + Registration Status */}
      <div className="flex shrink-0 flex-col items-center gap-2">
        <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
          {activity.imageUrl ? (
            <Image
              src={activity.imageUrl}
              alt={activity.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-center text-[10px] font-medium text-slate-400">
              No Image
            </div>
          )}
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${
            activity.registrationOpen
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              activity.registrationOpen
                ? "bg-emerald-600"
                : "bg-red-600"
            }`}
          />

          {activity.registrationOpen
            ? "Registry Open"
            : "Registry Closed"}
        </span>
      </div>
    </Link>
  );
}