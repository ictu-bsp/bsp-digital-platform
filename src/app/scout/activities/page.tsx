// src/app/scout/activities/page.tsx

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { Activity, FeaturedBanner } from "@/types/activities";
import { getPublishedActivities } from "@/services/activity.service";
import ScoutingActivitiesScreen from "./components/ScoutingActivitiesScreen";
import { getScoutByUserId, getRegisteredActivities, } from "@/services/activity-registration.service";

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

  const scout = await getScoutByUserId(user.id);

  const registeredActivities = scout ? await getRegisteredActivities(scout.id): [];

  const banners: FeaturedBanner[] = dbActivities
  .slice(0, 3)
  .map((activity) => ({
    id: activity.id,
    imageUrl: activity.imageUrl ?? "/placeholder-banner-1.svg",
    linkUrl: `/scout/activities/${activity.id}`,
    title: activity.title,
  }));

  const formatDateTime = (date: Date | null) => {
    if (!date) return "";

    return date.toLocaleString("en-PH", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  const activities: Activity[] = dbActivities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,

    startDate: formatDateTime(activity.startDate),

    endDate: formatDateTime(activity.endDate),

    location: activity.location,

    category: activity.category,
    councilId: activity.councilId,

    imageUrl: activity.imageUrl,

    createdAt: activity.createdAt.toISOString(),
    updatedAt: activity.updatedAt.toISOString(),
  }));

  const myActivities: Activity[] =
    registeredActivities.map((activity) => ({
      id: activity.id,

      title: activity.title,

      description: activity.description,

      startDate: formatDateTime(activity.startDate),

      endDate: formatDateTime(activity.endDate),

      location: activity.location,

      category: activity.category,

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
      myActivities={myActivities}
    />
  );
}