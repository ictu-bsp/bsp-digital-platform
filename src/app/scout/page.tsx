// src/app/scout/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { SparklesIcon, ChevronRightIcon, CalendarDaysIcon } from "@heroicons/react/24/solid";

import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import NotificationSection from "./components/NotificationSection";
import AnnouncementSection from "./components/AnnouncementSection";
import PromoCarousel, {
  PromoBanner,
} from "./components/PromoCarousel";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getPublishedActivities, getPublishedActivitiesForScope } from "@/services/activity.service";
import { getScoutByUserId, getScoutScope } from "@/services/scout.service";
import { getAnnouncementsForUser } from "@/services/announcement.service";
import { getNotificationsForUser } from "@/services/notification.service";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isScout =
    user.role === "SCOUT" ||
    user.role === "COUNCIL_ADMIN" ||
    user.role === "REGIONAL_ADMIN" ||
    user.role === "NATIONAL_ADMIN" ||
    user.role === "SUPER_ADMIN";

  const scout = await getScoutByUserId(user.id);

  const canOpenActivities =
    user.role === "COUNCIL_ADMIN" ||
    user.role === "REGIONAL_ADMIN" ||
    user.role === "NATIONAL_ADMIN" ||
    user.role === "SUPER_ADMIN" ||
    (user.role === "SCOUT" &&
      scout?.status === "ACTIVE" &&
      scout?.verificationStatus === "active");

  const dbActivities =
    user.role === "SCOUT"
      ? await getPublishedActivitiesForScope(
          await getScoutScope(user.id)
        )
      : await getPublishedActivities();

  const now = new Date();

  const scoutScope =
    user.role === "SCOUT"
      ? await getScoutScope(user.id)
      : { councilId: user.councilId ?? null, regionId: user.regionId ?? null };

  const announcements = await getAnnouncementsForUser({
    role: user.role,
    councilId: scoutScope.councilId,
    regionId: scoutScope.regionId,
  });

  const notifications = await getNotificationsForUser({
    role: user.role,
    councilId: scoutScope.councilId,
    regionId: scoutScope.regionId,
  });

  const openActivities = dbActivities.filter(
    (activity) =>
      !activity.registrationDeadline ||
      activity.registrationDeadline > now
  );

  const promoBanners: PromoBanner[] = openActivities
    .slice(0, 5)
    .map((activity, index) => ({
      id: activity.id,
      backgroundColor: [
        "#daf5e7",
        "#e7f2df",
        "#d7f0fc",
        "#f1f8e7",
        "#e9f6ea",
      ][index % 5],
      title: activity.title,
      imageUrl: activity.imageUrl,
      linkUrl: canOpenActivities
        ? `/scout/activities/${activity.id}`
        : "/scout/membership",
    }));

  return (
    <main className="min-h-screen bg-linear-to-b from-white via-[#f7fdf8] to-[#e7f6ea] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <Header
          userName={user.firstName}
          avatarUrl={user.avatarUrl}
        />

        <div className="flex-1 pb-28">
          <div className="space-y-5 px-3 py-4">

            <PromoCarousel banners={promoBanners} />

            <NotificationSection notifications={notifications} />

            <AnnouncementSection announcements={announcements} />

            <section className="px-4 pt-2">
              <h2 className="mb-3 text-lg font-bold text-slate-900">
                Featured Scouting Event
              </h2>

              <div className="space-y-3">
                <Link
                  href="/scout/jamboree/one-mindanao"
                  className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        OFFICIAL JAMBOREE
                      </span>
                    </div>

                    <h3 className="mt-1.5 truncate text-[0.95rem] font-bold text-slate-900">
                      7th One Mindanao Scout Jamboree
                    </h3>

                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
                      Join the National Merit Badge Challenge with 40 merit badges, earn completions, and download official certificates!
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700">
                        <SparklesIcon className="h-3.5 w-3.5 text-amber-500" />
                        40 Merit Badges
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700">
                        <CalendarDaysIcon className="h-3.5 w-3.5 text-emerald-700" />
                        September 2026
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center text-slate-400">
                    <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </div>
            </section>
          </div>
          
        </div>

        <BottomNav />
      </div>
    </main>
  );
}