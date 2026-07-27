// src/services/activity-registration.service.ts

import { db } from "@/db";
import { and, count, eq, inArray } from "drizzle-orm";
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

export async function unregisterScoutFromActivity(
  scoutId: string,
  activityId: string
) {
  return db
    .delete(activityRegistrations)
    .where(
      and(
        eq(activityRegistrations.scoutId, scoutId),
        eq(activityRegistrations.activityId, activityId)
      )
    );
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

export async function getRegisteredCount(
  activityId: string
): Promise<number> {
  const [row] = await db
    .select({ count: count() })
    .from(activityRegistrations)
    .where(eq(activityRegistrations.activityId, activityId));

  return row?.count ?? 0;
}

/**
 * Batched version of getRegisteredCount for a list of activities (e.g. the
 * activities list page), so we don't run one query per card.
 * Returns a map of activityId -> registered count. Activities with zero
 * registrations simply won't have a key in the map — treat a missing key
 * as 0 when reading it.
 */
export async function getRegisteredCounts(
  activityIds: string[]
): Promise<Record<string, number>> {
  if (activityIds.length === 0) return {};

  const rows = await db
    .select({
      activityId: activityRegistrations.activityId,
      count: count(),
    })
    .from(activityRegistrations)
    .where(inArray(activityRegistrations.activityId, activityIds))
    .groupBy(activityRegistrations.activityId);

  return Object.fromEntries(rows.map((r) => [r.activityId, r.count]));
}