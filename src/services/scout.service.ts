// src/services/scout.service.ts

import { db } from "@/db";
import { eq, inArray } from "drizzle-orm";
import { scouts, users, councils } from "@/db/schema";
import { registrations } from "@/db/schema/scout-registrations";
import { payments } from "@/db/schema/payments";
import { scoutApplications } from "@/db/schema/scoutApplications";
import { activityRegistrations } from "@/db/schema/activity-registrations";

// Get scout record using the authenticated user ID.
export async function getScoutByUserId(userId: string) {
  const [scout] = await db
    .select()
    .from(scouts)
    .where(eq(scouts.userId, userId));

  return scout ?? null;
}

// Returns the council and region scope used for filtering activities,
// announcements and other scoped resources.
export async function getScoutScope(userId: string) {
  const scout = await getScoutByUserId(userId);

  if (!scout || !scout.councilId) {
    return {
      councilId: null,
      regionId: null,
    };
  }

  const [council] = await db
    .select({
      regionId: councils.regionId,
    })
    .from(councils)
    .where(eq(councils.id, scout.councilId));

  return {
    councilId: scout.councilId,
    regionId: council?.regionId ?? null,
  };
}

// Creates a scout record after membership approval.
// Rank is REQUIRED so newly-approved scouts never default to KID.
export async function createScout(input: {
  userId: string;
  councilId: string;
  rank: typeof scouts.$inferInsert.rank;
  status?: typeof scouts.$inferInsert.status;
  membershipNumber?: string | null;
  joinedAt?: Date;
}) {
  const [scout] = await db
    .insert(scouts)
    .values({
      userId: input.userId,
      councilId: input.councilId,
      rank: input.rank,
      membershipNumber: input.membershipNumber ?? null,
      status: input.status ?? "PENDING",
      joinedAt: input.joinedAt,
    })
    .returning();

  return scout;
}

// Updates an existing scout profile.
export async function updateScoutProfile(
  scoutId: string,
  data: Partial<typeof scouts.$inferInsert>
) {
  const [updated] = await db
    .update(scouts)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(scouts.id, scoutId))
    .returning();

  return updated ?? null;
}

// Updates only the scout rank.
export async function updateScoutRank(
  scoutId: string,
  rank: typeof scouts.$inferInsert.rank
) {
  const [updated] = await db
    .update(scouts)
    .set({
      rank,
      updatedAt: new Date(),
    })
    .where(eq(scouts.id, scoutId))
    .returning();

  return updated ?? null;
}

// Activates a scout after registration approval.
export async function activateScout(scoutId: string) {
  const [updated] = await db
    .update(scouts)
    .set({
      status: "ACTIVE",
      isActive: true,
      joinedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(scouts.id, scoutId))
    .returning();

  return updated ?? null;
}

// Enables or disables a scout membership.
export async function setScoutMembershipActive(
  scoutId: string,
  isActive: boolean
) {
  const [updated] = await db
    .update(scouts)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(scouts.id, scoutId))
    .returning();

  return updated ?? null;
}

// Returns the roster used by the admin scout management page.
export async function getAllScoutsRoster() {
  return db
    .select({
      scoutId: scouts.id,
      userId: scouts.userId,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      councilName: councils.name,
      membershipNumber: scouts.membershipNumber,
      rank: scouts.rank,
      status: scouts.status,
      isActive: scouts.isActive,
      joinedAt: scouts.joinedAt,
    })
    .from(scouts)
    .innerJoin(users, eq(users.id, scouts.userId))
    .innerJoin(councils, eq(councils.id, scouts.councilId));
}

// Permanently removes a scout together with every dependent record.
export async function deleteScoutPermanently(scoutId: string) {
  return db.transaction(async (tx) => {
    const [scout] = await tx
      .select({
        userId: scouts.userId,
      })
      .from(scouts)
      .where(eq(scouts.id, scoutId));

    await tx
      .delete(activityRegistrations)
      .where(eq(activityRegistrations.scoutId, scoutId));

    const scoutRegistrations = await tx
      .select({
        id: registrations.id,
      })
      .from(registrations)
      .where(eq(registrations.scoutId, scoutId));

    const registrationIds = scoutRegistrations.map((r) => r.id);

    if (registrationIds.length) {
      await tx
        .delete(payments)
        .where(inArray(payments.registrationId, registrationIds));

      await tx
        .delete(registrations)
        .where(inArray(registrations.id, registrationIds));
    }

    if (scout) {
      await tx
        .delete(scoutApplications)
        .where(eq(scoutApplications.userId, scout.userId));
    }

    const [deleted] = await tx
      .delete(scouts)
      .where(eq(scouts.id, scoutId))
      .returning();

    return deleted ?? null;
  });
}