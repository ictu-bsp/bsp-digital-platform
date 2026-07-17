import { db } from "@/db";
import { eq, inArray } from "drizzle-orm";
import { scouts, users, councils } from "@/db/schema";
import { registrations } from "@/db/schema/scout-registrations";
import { payments } from "@/db/schema/payments";
import { scoutApplications } from "@/db/schema/scoutApplications";

export async function getScoutByUserId(userId: string) {
  const [scout] = await db
    .select()
    .from(scouts)
    .where(eq(scouts.userId, userId));

  return scout ?? null;
}


export async function createScout(input: { userId: string; councilId: string }) {
  const [scout] = await db
    .insert(scouts)
    .values({
      userId: input.userId,
      councilId: input.councilId,
    })
    .returning();

  return scout;
}

// Roster view for admin: one row per scout, joined with their account
// (name/email) and council name. Used by the Scout Roster admin page.
export async function getAllScoutsRoster() {
  const rows = await db
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
    .innerJoin(users, eq(scouts.userId, users.id))
    .innerJoin(councils, eq(scouts.councilId, councils.id))
    .orderBy(users.lastName);

  return rows;
}

// Testing utility for admin: flips a scout's isActive flag on/off.
// Does not touch the `status` enum (PENDING/ACTIVE/SUSPENDED/EXPIRED) —
// that's a separate lifecycle field tied to the approval workflow.
export async function setScoutMembershipActive(
  scoutId: string,
  isActive: boolean
) {
  const [updated] = await db
    .update(scouts)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(scouts.id, scoutId))
    .returning();

  return updated ?? null;
}

// TESTING ONLY â€” permanently deletes a scout's membership record,
// their registrations, any payments tied to those registrations, AND
// their scoutApplications rows (keyed by userId, not scoutId, so we
// fetch userId first before the scouts row is gone). The users row
// itself is left intact so the account could theoretically
// re-register from scratch with a clean application history.
// Runs in a transaction: no partial deletes if any step fails.
export async function deleteScoutPermanently(scoutId: string) {
  return await db.transaction(async (tx) => {
    const [scout] = await tx
      .select({ userId: scouts.userId })
      .from(scouts)
      .where(eq(scouts.id, scoutId));

    const scoutRegistrations = await tx
      .select({ id: registrations.id })
      .from(registrations)
      .where(eq(registrations.scoutId, scoutId));
    const registrationIds = scoutRegistrations.map((r) => r.id);
    if (registrationIds.length > 0) {
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