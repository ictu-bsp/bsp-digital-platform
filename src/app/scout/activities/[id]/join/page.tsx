// src/app/scout/activities/[id]/join/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";

import Header from "@/app/scout/components/Header";
import BottomNav from "@/app/scout/components/BottomNav";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getActivityById } from "@/services/activity.service";
import {
  getScoutByUserId,
  isScoutRegistered,
  getRegisteredCount,
} from "@/services/activity-registration.service";
import { meetsRankRequirement, RANK_LABELS } from "@/lib/utils/rank";
import { joinActivityAction } from "@/app/actions/activities";


interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function JoinActivityPage({
  params,
}: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { id: activityId } = await params;

  const activity = await getActivityById(activityId);

  if (!activity) {
    redirect("/scout/activities");
  }

  const scout = await getScoutByUserId(user.id);

  if (!scout) {
    redirect("/scout/membership");
  }

  // Already joined -- nothing to confirm, just go back to the detail page.
  const alreadyRegistered = await isScoutRegistered(scout.id, activityId);
  if (alreadyRegistered) {
    redirect(`/scout/activities/${activityId}`);
  }

  const registrationClosed =
    activity.registrationDeadline != null &&
    activity.registrationDeadline < new Date();

  const registeredCount = await getRegisteredCount(activityId);
  const isFull =
    activity.maxParticipants != null &&
    registeredCount >= activity.maxParticipants;

  const isEligible = meetsRankRequirement(scout.rank, activity.minimumRank);

  // Bound server action for the confirm button below.
  async function confirmJoin() {
    "use server";
    const result = await joinActivityAction(activityId);
    if (result.success) {
      redirect(`/scout/activities/${activityId}`);
    }
    // On failure, send them back to the detail page -- the join button
    // there will simply be available again, and the underlying issue
    // (deadline/capacity/rank) will already be visible on this page if
    // they try again.
    redirect(`/scout/activities/${activityId}`);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#f7fdf8] to-[#e7f6ea] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <Header
          userName={user.firstName}
          avatarUrl={user.avatarUrl ?? undefined}
        />

        <div className="flex-1 px-4 py-6">
          <Link
            href={`/scout/activities/${activityId}`}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 shadow-sm"
          >
            <span aria-hidden="true">←</span>
            Back to activity
          </Link>

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-700">
            Join Activity
          </p>
          <h1 className="mt-1 text-xl font-bold text-green-900">
            {activity.title}
          </h1>

          {!isEligible && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
              <p className="font-bold text-red-700">
                Rank Requirement Not Met
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                This activity requires at least{" "}
                <strong>
                  {activity.minimumRank
                    ? RANK_LABELS[activity.minimumRank]
                    : "—"}
                </strong>{" "}
                rank to join. Your current rank is{" "}
                <strong>{RANK_LABELS[scout.rank]}</strong>, so you're not
                yet eligible to register for this activity.
              </p>
            </div>
          )}

          {isEligible && registrationClosed && (
            <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="font-bold text-gray-700">
                Registration Closed
              </p>
              <p className="mt-2 text-sm text-slate-600">
                The registration deadline for this activity has passed.
              </p>
            </div>
          )}

          {isEligible && !registrationClosed && isFull && (
            <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <p className="font-bold text-gray-700">
                Activity Full
              </p>
              <p className="mt-2 text-sm text-slate-600">
                This activity has reached its maximum number of
                participants ({activity.maxParticipants}).
              </p>
            </div>
          )}

          {isEligible && !registrationClosed && !isFull && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="font-bold text-emerald-800">
                You're Eligible!
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Your rank ({RANK_LABELS[scout.rank]}) meets the
                requirement for this activity
                {activity.minimumRank
                  ? ` (${RANK_LABELS[activity.minimumRank]} or higher)`
                  : ""}
                . Confirm below to register.
              </p>

              <form action={confirmJoin} className="mt-4">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-700 px-4 py-3 text-center text-base font-semibold text-white transition hover:bg-emerald-800"
                >
                  Confirm Join
                </button>
              </form>
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </main>
  );
}
