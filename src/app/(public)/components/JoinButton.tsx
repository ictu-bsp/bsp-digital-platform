//src/app/(public)/components/JoinButton.tsx

"use client";

import Link from "next/link";

interface JoinButtonProps {
  activityId: string;
  registrationDeadline?: Date | string | null;
  alreadyJoined?: boolean;
}

export default function JoinButton({
  activityId,
  registrationDeadline,
  alreadyJoined = false,
}: JoinButtonProps) {
  const registrationClosed =
    registrationDeadline != null &&
    new Date(registrationDeadline) < new Date();

  // Scout has already joined
  if (alreadyJoined) {
    return (
      <button
        disabled
        className="w-full cursor-default rounded-xl bg-blue-700 px-4 py-3 text-base font-semibold text-white"
      >
        ✓ Joined
      </button>
    );
  }

  // Registration period is over
  if (registrationClosed) {
    return (
      <button
        disabled
        className="w-full cursor-not-allowed rounded-xl bg-gray-500 px-4 py-3 text-base font-semibold text-white"
      >
        Closed
      </button>
    );
  }

  // Registration still open
  return (
    <Link
      href={`/scout/activities/${activityId}/join`}
      className="block w-full rounded-xl bg-emerald-700 px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-emerald-800"
    >
      Join
    </Link>
  );
}