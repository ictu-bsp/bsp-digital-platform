// src/app/scout/activities/page.tsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { Activity, FeaturedBanner } from "@/types/activities";
import {
  getPublishedActivities,
  getPublishedActivitiesForScope,
} from "@/services/activity.service";
import { getScoutByUserId, getScoutScope } from "@/services/scout.service";
import ScoutingActivitiesScreen from "./components/ScoutingActivitiesScreen";
import {
  getRegisteredActivities,
  getRegisteredCounts,
} from "@/services/activity-registration.service";

function formatDateTime(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  }).format(d);
}

export default async function ActivitiesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isScout = user.role === "SCOUT";
  const scout = await getScoutByUserId(user.id);
  console.log("is scout?", isScout);
  const dbActivities = isScout
    ? await getPublishedActivitiesForScope(await getScoutScope(user.id))
    : await getPublishedActivities();

  const now = new Date();

  const registeredActivities = scout
    ? await getRegisteredActivities(scout.id)
    : [];

  const registrationCounts = await getRegisteredCounts(
    dbActivities.map((a) => a.id),
  );

  const bannerColors = ["#daf5e7", "#e7f2df", "#d7f0fc", "#f1f8e7", "#e9f6ea"];

  const banners: FeaturedBanner[] = dbActivities
    .filter(
      (activity) =>
        !activity.registrationDeadline ||
        new Date(activity.registrationDeadline) > now,
    )
    .slice(0, 3)
    .map((activity, index) => ({
      id: activity.id,
      title: activity.title,
      linkUrl: isScout ? `/scout/activities/${activity.id}` : "#",
      backgroundColor: bannerColors[index % bannerColors.length],
      imageUrl:
        activity.imageUrl && activity.imageUrl.trim() !== ""
          ? activity.imageUrl
          : null,
    }));

  const mapActivity = (activity: (typeof dbActivities)[0]): Activity => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    startDate: formatDateTime(activity.startDate),
    endDate: formatDateTime(activity.endDate),
    registrationOpen:
      !activity.registrationDeadline ||
      new Date(activity.registrationDeadline) > now,
    maxParticipants: activity.maxParticipants,
    registeredCount: registrationCounts[activity.id] ?? 0,
    minimumSection: activity.minimumSection,
    location: activity.location,
    category: activity.category,
    councilId: activity.councilId,
    imageUrl: activity.imageUrl,
    createdAt: new Date(activity.createdAt).toISOString(),
    updatedAt: new Date(activity.updatedAt).toISOString(),
  });

  const activities: Activity[] = dbActivities
    .map(mapActivity)
    .sort((a, b) => Number(b.registrationOpen) - Number(a.registrationOpen));

  const myActivities: Activity[] = registeredActivities
    .map(mapActivity)
    .sort((a, b) => Number(b.registrationOpen) - Number(a.registrationOpen));

  return (
    <ScoutingActivitiesScreen
      userName={user.firstName}
      avatarUrl={user.avatarUrl ?? undefined}
      banners={banners}
      activities={activities}
      myActivities={myActivities}
      isScout={isScout}
    />
  );
}