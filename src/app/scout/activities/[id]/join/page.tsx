// src/app/scout/activities/[id]/join/page.tsx

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";

import { getActivityById } from "@/services/activity.service";

import {
  getScoutByUserId,
  isScoutRegistered,
  registerScoutForActivity,
} from "@/services/activity-registration.service";

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

  // Verify activity exists
  const activity = await getActivityById(activityId);

  if (!activity) {
    redirect("/scout/activities");
  }

  // Registration deadline has passed
  if (
    activity.registrationDeadline &&
    activity.registrationDeadline < new Date()
  ) {
    redirect(`/scout/activities/${activityId}`);
  }

  // Verify scout account
  const scout = await getScoutByUserId(user.id);

  if (!scout) {
    redirect("/scout/membership");
  }

  // Prevent duplicate registrations
  const alreadyRegistered = await isScoutRegistered(
    scout.id,
    activityId
  );

  if (!alreadyRegistered) {
    await registerScoutForActivity(
      scout.id,
      activityId
    );
  }

  redirect(`/scout/activities/${activityId}`);
}