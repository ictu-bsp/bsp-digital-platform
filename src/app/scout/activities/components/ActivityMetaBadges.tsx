//src/app/scout/activities/components/ActivityMetaBadges.tsx

import {
  CalendarDaysIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

type Props = {
  startDate: string;
  endDate?: string;
  location: string;
  cost?: string;
  registrationDeadline?: string;
};

export default function ActivityMetaBadges({
  startDate,
  endDate,
  location,
  cost = "Free",
  registrationDeadline,
}: Props) {
  const deadlineDate = registrationDeadline
    ? new Date(registrationDeadline)
    : null;

  const closed = deadlineDate != null && deadlineDate < new Date();

  const formattedDeadline = deadlineDate
    ? deadlineDate.toLocaleString("en-PH", {
        dateStyle: "long",
        timeStyle: "short",
      })
    : null;

  // - No deadline set -> generic "Registration Open"
  // - Deadline in the future -> "Registration Open until <date>"
  // - Deadline has passed -> "Registration Closed since <date>"
  const registrationLabel = (() => {
    if (!formattedDeadline) {
      return closed ? "Registration Closed" : "Registration Open";
    }
    return closed
      ? `Registration Closed since ${formattedDeadline}`
      : `Registration Open until ${formattedDeadline}`;
  })();

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-blue-800 px-4 py-3 text-sm font-medium text-white">
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="h-4 w-4" />
          <span>
            {startDate}
            {endDate ? ` - ${endDate}` : ""}
          </span>
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

      <div
        className={`rounded-2xl px-4 py-3 text-sm font-medium text-white ${
          closed ? "bg-red-700" : "bg-green-700"
        }`}
      >
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="h-4 w-4 shrink-0" />
          <span>{registrationLabel}</span>
        </div>
      </div>
    </div>
  );
}