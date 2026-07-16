// src/app/scout/activities/page.tsx

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getPublishedActivities } from "@/services/activity.service";
import type { Activity, FeaturedBanner } from "@/types/activities";
import ScoutingActivitiesScreen from "./components/ScoutingActivitiesScreen";

export default async function ActivitiesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const canViewActivities =
    user.role === "SCOUT" ||
    user.role === "COUNCIL_ADMIN" ||
    user.role === "SUPER_ADMIN";

  if (!canViewActivities) {
    redirect("/scout/membership");
  }

  const dbActivities = await getPublishedActivities();

  const banners: FeaturedBanner[] = dbActivities
  .slice(0, 3)
  .map((activity) => ({
    id: activity.id,
    imageUrl: activity.imageUrl ?? "/placeholder-banner-1.svg",
    linkUrl: `/scout/activities/${activity.id}`,
    title: activity.title,
  }));

  console.log("=== Activities from DB ===");

  for (const activity of dbActivities) {
    console.log({
      title: activity.title,
      startDate: activity.startDate,
      endDate: activity.endDate,
      startIsDate: activity.startDate instanceof Date,
      endIsDate: activity.endDate instanceof Date,
    });
  }

  const activities: Activity[] = dbActivities.map((activity) => ({
    id: activity.id,

    title: activity.title,

    description: activity.description,

    startDate: activity.startDate.toLocaleDateString(),

    endDate: activity.endDate
      ? activity.endDate.toLocaleDateString()
      : "",

    location: activity.location,

    category: activity.category,

    scope: activity.scope,

    councilId: activity.councilId,

    imageUrl: activity.imageUrl,

    createdAt: activity.createdAt.toISOString(),

    updatedAt: activity.updatedAt.toISOString(),
  }));

  return (
    <ScoutingActivitiesScreen
      userName={user.firstName}
      avatarUrl={user.avatarUrl ?? undefined}
      banners={banners}
      activities={activities}
    />
  );
}