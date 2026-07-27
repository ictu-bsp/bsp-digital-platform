//src/app/scout/activities/[id]/leave/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import Header from "@/app/scout/components/Header";
import BottomNav from "@/app/scout/components/BottomNav";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getActivityById } from "@/services/activity.service";
import {
  getScoutByUserId,
  isScoutRegistered,
} from "@/services/activity-registration.service";
import { leaveActivityAction } from "@/app/actions/activities";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function LeaveActivityPage({
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

  const alreadyRegistered = await isScoutRegistered(
    scout.id,
    activityId
  );

  if (!alreadyRegistered) {
    redirect(`/scout/activities/${activityId}`);
  }

  async function confirmLeave() {
    "use server";

    const result = await leaveActivityAction(activityId);

    if (result.success) {
      redirect(`/scout/activities/${activityId}`);
    }

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

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-red-700">
            Leave Activity
          </p>

          <h1 className="mt-1 text-xl font-bold text-red-900">
            {activity.title}
          </h1>

          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-bold text-red-700">
              Leave this activity?
            </p>

            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              You will be removed from the participant list immediately.
              You may join again later provided registration is still open
              and the activity has not reached its maximum capacity.
            </p>

            <form action={confirmLeave} className="mt-5">
              <button
                type="submit"
                className="w-full rounded-xl bg-red-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-red-700"
              >
                Confirm Leave
              </button>
            </form>
          </div>
        </div>

        <BottomNav />
      </div>
    </main>
  );
}