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

  const now = new Date();

  const scout = await getScoutByUserId(user.id);

  const registeredActivities = scout ? await getRegisteredActivities(scout.id): [];

  const bannerColors = [
  "#daf5e7",
  "#e7f2df",
  "#d7f0fc",
  "#f1f8e7",
  "#e9f6ea",
];

  const banners: FeaturedBanner[] = dbActivities
    .filter(
      (activity) =>
        !activity.registrationDeadline ||
        activity.registrationDeadline > now
    )
    .slice(0, 3)
    .map((activity, index) => ({
      id: activity.id,

      title: activity.title,

      linkUrl: `/scout/activities/${activity.id}`,

      backgroundColor:
        bannerColors[index % bannerColors.length],

      imageUrl:
        activity.imageUrl &&
        activity.imageUrl.trim() !== ""
          ? activity.imageUrl
          : null,
    }));

  const formatDateTime = (date: Date | null) => {
    if (!date) return "";

    return date.toLocaleString("en-PH", {
      dateStyle: "long",
      timeStyle: "short",
    });
  };

  const activities: Activity[] = dbActivities
  .map((activity) => ({
    id: activity.id,

    title: activity.title,

    description: activity.description,

    startDate: formatDateTime(activity.startDate),

    endDate: formatDateTime(activity.endDate),

    registrationOpen:
      !activity.registrationDeadline ||
      activity.registrationDeadline > now,

    location: activity.location,

    category: activity.category,

    councilId: activity.councilId,

    imageUrl: activity.imageUrl,

    createdAt: activity.createdAt.toISOString(),

    updatedAt: activity.updatedAt.toISOString(),
  }))
  .sort((a, b) => Number(b.registrationOpen) - Number(a.registrationOpen));

  const myActivities: Activity[] =
  registeredActivities
    .map((activity) => ({
      id: activity.id,

      title: activity.title,

      description: activity.description,

      startDate: formatDateTime(activity.startDate),

      endDate: formatDateTime(activity.endDate),

      registrationOpen:
        !activity.registrationDeadline ||
        activity.registrationDeadline > now,

      location: activity.location,

      category: activity.category,

      councilId: activity.councilId,

      imageUrl: activity.imageUrl,

      createdAt: activity.createdAt.toISOString(),

      updatedAt: activity.updatedAt.toISOString(),
    }))
    .sort((a, b) => Number(b.registrationOpen) - Number(a.registrationOpen));

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