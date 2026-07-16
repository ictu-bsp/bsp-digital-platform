import { db } from "@/db";
import { and, eq } from "drizzle-orm";
import { scouts } from "@/db/schema/scouts";
import { activities } from "@/db/schema/activities";
import { activityRegistrations } from "@/db/schema/activity-registrations";

export async function getScoutByUserId(userId: string) {
  return db.query.scouts.findFirst({
    where: eq(scouts.userId, userId),
  });
}

export async function isScoutRegistered(
  scoutId: string,
  activityId: string
) {
  const registration =
    await db.query.activityRegistrations.findFirst({
      where: and(
        eq(activityRegistrations.scoutId, scoutId),
        eq(activityRegistrations.activityId, activityId)
      ),
    });

  return !!registration;
}

export async function registerScoutForActivity(
  scoutId: string,
  activityId: string
) {
  return db.insert(activityRegistrations).values({
    scoutId,
    activityId,
  });
}

export async function getRegisteredActivities(
  scoutId: string
) {
  return db
    .select({
      activity: activities,
    })
    .from(activityRegistrations)
    .innerJoin(
      activities,
      eq(
        activityRegistrations.activityId,
        activities.id
      )
    )
    .where(
      eq(activityRegistrations.scoutId, scoutId)
    )
    .then((rows) => rows.map((row) => row.activity));
}