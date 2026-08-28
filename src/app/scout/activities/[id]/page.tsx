// src/app/scout/activities/[id]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LockClosedIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Header from "@/app/scout/components/Header";
import BottomNav from "@/app/scout/components/BottomNav";
import JoinButton from "@/app/scout/activities/components/JoinButton";
import LeaveButton from "@/app/scout/activities/components/LeaveButton";
import ActivityMetaBadges from "@/app/scout/activities/components/ActivityMetaBadges";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getActivityById } from "@/services/activity.service";
import {
  getScoutByUserId,
  isScoutRegistered,
  getRegisteredCount,
} from "@/services/activity-registration.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const activity = await getActivityById(id);

  if (!activity) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-[#f7fdf8] to-[#e7f6ea] text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-md flex-col">
          <Header
            userName={user.firstName}
            avatarUrl={user.avatarUrl ?? undefined}
          />
          <div className="flex-1 px-4 py-6">
            <p className="text-sm text-slate-600">Activity not found.</p>
          </div>
          <BottomNav />
        </div>
      </main>
    );
  }

  const scout = await getScoutByUserId(user.id);

  // Check if user is a fully verified Scout
  const isVerifiedScout =
    user.role === "SCOUT" &&
    scout != null &&
    scout.status === "ACTIVE";

  const alreadyJoined = scout
    ? await isScoutRegistered(scout.id, activity.id)
    : false;
  const registeredCount = await getRegisteredCount(activity.id);
  const isFull =
    activity.maxParticipants != null &&
    registeredCount >= activity.maxParticipants;

  const formatDate = (date: Date) =>
    date.toLocaleString("en-PH", {
      dateStyle: "long",
      timeStyle: "short",
    });

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-white via-[#f7fdf8] to-[#e7f6ea] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <Header
          userName={user.firstName}
          avatarUrl={user.avatarUrl ?? undefined}
        />

        {/* Scrollable details: blurred when unverified */}
        <div
          className={`flex-1 overflow-y-auto pb-28 transition-all duration-300 ${
            !isVerifiedScout
              ? "pointer-events-none select-none blur-sm opacity-40"
              : ""
          }`}
        >
          <div className="space-y-5 px-4 py-4">
            <Link
              href="/scout/activities"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 shadow-sm"
            >
              <span aria-hidden="true">←</span>Back to activities
            </Link>

            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-700">
              Scouting Activities
            </p>

            <h1 className="text-2xl font-bold leading-tight text-green-900">
              {activity.title}
            </h1>

            <div className="flex flex-col gap-6 lg:flex-row">
              <div className="flex-1 space-y-4">
                <p className="text-sm leading-7 text-slate-700">
                  {activity.description}
                </p>

                <ActivityMetaBadges
                  startDate={formatDate(activity.startDate)}
                  endDate={
                    activity.endDate ? formatDate(activity.endDate) : undefined
                  }
                  location={activity.location}
                  cost={
                    activity.registrationFee
                      ? `₱${activity.registrationFee}`
                      : "Free"
                  }
                  registrationDeadline={activity.registrationDeadline?.toISOString()}
                  registeredCount={registeredCount}
                  maxParticipants={activity.maxParticipants}
                />
              </div>

              <div className="flex items-center justify-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-xl border-[10px] border-emerald-200 bg-emerald-100 shadow-inner">
                  <Image
                    src={activity.imageUrl ?? "/placeholder-banner-1.svg"}
                    alt={activity.title}
                    width={80}
                    height={80}
                    className="h-20 w-20 rounded-xl object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              {alreadyJoined ? (
                <LeaveButton activityId={activity.id} />
              ) : isFull ? (
                <button
                  disabled
                  className="w-full cursor-not-allowed rounded-xl bg-slate-300 px-4 py-3 text-base font-semibold text-slate-600"
                >
                  Activity Full
                </button>
              ) : (
                <JoinButton
                  activityId={activity.id}
                  registrationDeadline={activity.registrationDeadline}
                  alreadyJoined={alreadyJoined}
                />
              )}
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Responsive Toast / Modal for Unverified Users */}
      {!isVerifiedScout && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/25 backdrop-blur-[1px] sm:items-center sm:p-4">
          <div className="w-full max-w-md transform-gpu rounded-t-[2rem] border-t border-slate-100 bg-white px-6 pb-8 pt-4 shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom sm:max-w-sm sm:rounded-3xl sm:border sm:border-slate-200 sm:p-6 sm:slide-in-from-bottom-0 sm:fade-in-0 sm:zoom-in-95">
            {/* Header / Dismiss */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Access Restricted • Verification
              </span>
              <Link
                href="/scout/activities"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </Link>
            </div>

            {/* Circular Centered Icon */}
            <div className="my-4 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-8 ring-emerald-50/50">
                <LockClosedIcon className="h-9 w-9 stroke-[1.75]" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900">
                Membership Required
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                Complete or verify your Scout membership to unlock event
                schedules, location details, and active registrations.
              </p>
            </div>

            {/* Status Card */}
            <div className="mt-4 rounded-2xl bg-slate-50/80 p-3.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-500">Account Status:</span>
                <span className="font-bold text-amber-600">Unverified</span>
              </div>
              <div className="mt-1 flex items-center justify-between border-t border-slate-200/60 pt-1">
                <span className="font-medium text-slate-500">Requirement:</span>
                <span className="font-medium text-slate-800">Active Membership ID</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-5">
              <Link
                href="/scout/membership"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-900 active:scale-[0.99]"
              >
                Verify Scout Membership
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}