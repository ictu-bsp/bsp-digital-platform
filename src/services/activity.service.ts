import { db } from "@/db";
import { activities } from "@/db/schema/activities";
import { desc, eq } from "drizzle-orm";

export async function getActivities() {
  return db.query.activities.findMany({
    orderBy: desc(activities.startDate),
  });
}

export async function getPublishedActivities() {
  return db.query.activities.findMany({
    where: eq(activities.isPublished, true),
    orderBy: desc(activities.startDate),
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