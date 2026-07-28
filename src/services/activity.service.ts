//src/services/activity.service.ts

import { db } from "@/db";
import { activities } from "@/db/schema/activities";
import { and, desc, eq, isNull, or } from "drizzle-orm";

export async function getActivities() {
  return db.query.activities.findMany({
    orderBy: desc(activities.startDate),
  });
}

export async function getPublishedActivities() {
  return db.query.activities.findMany({
    where: eq(activities.isPublished, true),
    orderBy: desc(activities.createdAt),
  });
}

/**
 * Same as getPublishedActivities, but scoped to what a scout (or any
 * viewer tied to a specific council/region) is actually allowed to see:
 * national activities (no council/region set) are visible to everyone,
 * plus anything scoped to their own council or their council's region.
 */
export async function getPublishedActivitiesForScope(scope: {
  councilId?: string | null;
  regionId?: string | null;
}) {
  const nationalOnly = and(
    isNull(activities.councilId),
    isNull(activities.regionId)
  );

  return db.query.activities.findMany({
    where: and(
      eq(activities.isPublished, true),
      or(
        nationalOnly,
        scope.councilId
          ? eq(activities.councilId, scope.councilId)
          : undefined,
        scope.regionId
          ? eq(activities.regionId, scope.regionId)
          : undefined
      )
    ),
    orderBy: desc(activities.createdAt),
  });
}

export async function getActivityById(id: string) {
  return db.query.activities.findFirst({
    where: eq(activities.id, id),
  });
}

export async function createActivity(
  data: typeof activities.$inferInsert
) {
  const [activity] = await db
    .insert(activities)
    .values(data)
    .returning();

  return activity;
}

export async function updateActivity(
  id: string,
  data: Partial<typeof activities.$inferInsert>
) {
  const [activity] = await db
    .update(activities)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(activities.id, id))
    .returning();

  return activity;
}

export async function deleteActivity(id: string) {
  await db
    .delete(activities)
    .where(eq(activities.id, id));
}