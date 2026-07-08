import {
  CalendarDaysIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import type { ActivityMetaBadgesProps } from '@/types/activity-details';

export default function ActivityMetaBadges({
  startDate,
  endDate,
  location,
  cost,
  status,
}: ActivityMetaBadgesProps) {
  const statusText =
    status === 'ongoing'
      ? 'On-going Registration'
      : status === 'closed'
        ? 'Registration Closed'
        : 'Upcoming Registration';

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-blue-800 px-4 py-3 text-sm font-medium text-white">
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="h-4 w-4" />
          <span>{startDate} - {endDate}</span>
        </div>
      </div>

      <div className="rounded-2xl bg-blue-800 px-4 py-3 text-sm font-medium text-white">
        <div className="flex items-center gap-2">
          <MapPinIcon className="h-4 w-4" />
          <span>{location}</span>
        </div>
      </div>

      <div className="rounded-2xl bg-blue-800 px-4 py-3 text-sm font-medium text-white">
        <div className="flex items-center gap-2">
          <CurrencyDollarIcon className="h-4 w-4" />
          <span>{cost}</span>
        </div>
      </div>

      <div className="rounded-2xl bg-green-800 px-4 py-3 text-sm font-medium text-white">
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="h-4 w-4" />
          <span>{statusText}</span>
        </div>
      </div>
    </div>
  );
}
