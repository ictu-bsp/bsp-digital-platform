//src/app/scout/page.tsx

import { redirect } from "next/navigation";

import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import ProgressSection from "./components/ProgressSection";
import NotificationSection from "./components/NotificationSection";
import AnnouncementSection from "./components/AnnouncementSection";
import PromoCarousel, {
  PromoBanner,
} from "./components/PromoCarousel";

import { getCurrentUser } from "@/lib/auth/current-user";
import { getPublishedActivities } from "@/services/activity.service";
import { getScoutByUserId } from "@/services/activity-registration.service";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isScout =
    user.role === "SCOUT" ||
    user.role === "COUNCIL_ADMIN" ||
    user.role === "SUPER_ADMIN";

  const scout = await getScoutByUserId(user.id);

  const canOpenActivities =
    user.role === "COUNCIL_ADMIN" ||
    user.role === "SUPER_ADMIN" ||
    (user.role === "SCOUT" &&
      scout?.status === "ACTIVE" &&
      scout?.verificationStatus === "active");

  const dbActivities = await getPublishedActivities();

  const now = new Date();

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
    <main className="min-h-screen bg-gradient-to-b from-white via-[#f7fdf8] to-[#e7f6ea] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">

        <Header
          userName={user.firstName}
          avatarUrl={user.avatarUrl}
        />

        <div className="flex-1 pb-28">
          <div className="space-y-5 px-1 py-5">

            <PromoCarousel banners={promoBanners} />

            <NotificationSection role={user.role} />

            <AnnouncementSection role={user.role} />

            {isScout && <ProgressSection />}

          </div>
        </div>

        <BottomNav />

      </div>
    </main>
  );
}