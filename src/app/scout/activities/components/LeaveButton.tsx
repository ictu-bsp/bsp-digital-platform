//src/app/(public)/components/LeaveButton.tsx

import Link from "next/link";

interface LeaveButtonProps {
  activityId: string;
}
//Scout Activites Leave Button Functions

export default function LeaveButton({
  activityId,
}: LeaveButtonProps) {
  return (
    <Link
      href={`/scout/activities/${activityId}/leave`}
      className="flex w-full items-center justify-center rounded-xl bg-red-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-red-700"
    >
      Leave Activity
    </Link>
  );
}