// src/services/payment.service.ts

import { db } from "@/db";
import { eq, or } from "drizzle-orm";
import { payments, registrations, scoutApplications, scouts } from "@/db/schema";

<<<<<<< HEAD

// Maps the wizard's scoutingPosition value to the scouts.rank enum.
// scoutingPosition is section-level (kab_scout/boy_scout/senior_scout/rover);
// scouts.rank is the DB enum (KID/KAB/BOY/SENIOR/ROVER). "KID" has no
// corresponding wizard option today, so it stays the default fallback
// only when scoutingPosition is missing/unrecognized.
const SCOUTING_POSITION_TO_RANK: Record<string, "KAB" | "BOY" | "SENIOR" | "ROVER"> = {
  kab_scout: "KAB",
  boy_scout: "BOY",
  senior_scout: "SENIOR",
  rover: "ROVER",
};


export async function createPaymentRecord(registrationId: string) {
  try {
    let targetRegistrationId = registrationId;
=======
function mapApplicationRank(
  advancementRank: string | null | undefined,
  scoutingPosition?: string | null | undefined
): typeof scouts.$inferInsert.rank {
  const target = (advancementRank || scoutingPosition || "").trim().toUpperCase();
>>>>>>> 74efdc55341de5125842f4ff292ec287390d5716

  if (!target) return "BOY";

  if (target.includes("KID")) return "KID";
  if (target.includes("KAB")) return "KAB";
  if (target.includes("SENIOR")) return "SENIOR";
  if (target.includes("ROVER")) return "ROVER";
  if (target.includes("BOY")) return "BOY";

  switch (target) {
    case "KID":
    case "KID SCOUT":
      return "KID";

    case "KAB":
    case "KAB SCOUT":
      return "KAB";

    case "BOY":
    case "BOY SCOUT":
      return "BOY";

    case "SENIOR":
    case "SENIOR SCOUT":
      return "SENIOR";

    case "ROVER":
    case "ROVER SCOUT":
      return "ROVER";

    default:
      console.warn(
        `Unknown rank/position "${target}". Falling back to BOY.`
      );
      return "BOY";
  }
}

// Creates (or reuses) the payment record tied to a scout registration & application.
export async function createPaymentRecord(idOrRegistrationId: string) {
  try {
    let targetRegistrationId: string | null = idOrRegistrationId;
    let targetApplicationId: string | null = null;

    // Check whether the supplied ID is an application ID.
    const [application] = await db
      .select()
      .from(scoutApplications)
      .where(eq(scoutApplications.id, idOrRegistrationId))
      .limit(1);

    if (application) {
      targetApplicationId = application.id;

      // Ensure the applicant already has a scout profile.
      let [scout] = await db
        .select()
        .from(scouts)
        .where(eq(scouts.userId, application.userId))
        .limit(1);

      const mappedRank = mapApplicationRank(
        application.advancementRank,
        application.scoutingPosition
      );

      // Create or sync the scout profile using the application's actual information.
      if (!scout) {
<<<<<<< HEAD
        // Create scout entry if it doesn't exist yet
        const resolvedRank = SCOUTING_POSITION_TO_RANK[application.scoutingPosition ?? ""];

=======
>>>>>>> 74efdc55341de5125842f4ff292ec287390d5716
        [scout] = await db
          .insert(scouts)
          .values({
            userId: application.userId,
            councilId: application.preferredCouncilId,
<<<<<<< HEAD
            ...(resolvedRank ? { rank: resolvedRank } : {}),
          })
=======

            // Preserve the applicant's selected rank instead of using default "KID".
            rank: mappedRank,

            // Newly created scouts remain pending until approval.
            status: "PENDING",
          } as typeof scouts.$inferInsert)
>>>>>>> 74efdc55341de5125842f4ff292ec287390d5716
          .returning();
      } else if ((scout as any).rank !== mappedRank) {
        const [updatedScout] = await db
          .update(scouts)
          .set({
            rank: mappedRank,
            councilId: application.preferredCouncilId || scout.councilId,
            updatedAt: new Date(),
          } as any)
          .where(eq(scouts.id, scout.id))
          .returning();

        scout = updatedScout;
      }

      // Reuse an existing registration whenever possible.
      const [existingRegistration] = await db
        .select()
        .from(registrations)
        .where(eq(registrations.scoutId, scout.id))
        .limit(1);

      if (existingRegistration) {
        targetRegistrationId = existingRegistration.id;
      } else {
        // Generate the registration validity period.
        const now = new Date();
        const startDate = now.toISOString().split("T")[0];
        const yearsToAdd = application.requestedRegistrationYears ?? 1;

        const endDateObject = new Date(now);
        endDateObject.setFullYear(endDateObject.getFullYear() + yearsToAdd);
        const endDate = endDateObject.toISOString().split("T")[0];

        // Create the pending registration.
        const [newRegistration] = await db
          .insert(registrations)
          .values({
            scoutId: scout.id,
            councilId: application.preferredCouncilId,
            startDate,
            endDate,
            registrationYears: yearsToAdd,
            status: "pending",
          })
          .returning();

        targetRegistrationId = newRegistration.id;
      }
    }

    // Check if a payment record already exists for this registration or application
    let existingPayment = null;
    if (targetRegistrationId || targetApplicationId) {
      const conditions = [];
      if (targetRegistrationId) {
        conditions.push(eq(payments.registrationId, targetRegistrationId));
      }
      if (targetApplicationId && (payments as any).applicationId) {
        conditions.push(eq((payments as any).applicationId, targetApplicationId));
      }

      if (conditions.length > 0) {
        const [foundPayment] = await db
          .select()
          .from(payments)
          .where(or(...conditions))
          .limit(1);
        existingPayment = foundPayment;
      }
    }

    if (existingPayment) {
      // Ensure applicationId is preserved on existing payment if missing
      if (
        targetApplicationId &&
        (payments as any).applicationId &&
        !(existingPayment as any).applicationId
      ) {
        await db
          .update(payments)
          .set({
            applicationId: targetApplicationId,
            updatedAt: new Date(),
          } as any)
          .where(eq(payments.id, existingPayment.id));
      }
      return existingPayment;
    }

    // Create a new payment record.
    const paymentPayload: any = {
      registrationId: targetRegistrationId,
      paymentStatus: "awaiting_payment",
    };

    if (targetApplicationId && (payments as any).applicationId) {
      paymentPayload.applicationId = targetApplicationId;
    }

    const [record] = await db
      .insert(payments)
      .values(paymentPayload)
      .returning();

    return record;
  } catch (error) {
    console.error("Error creating payment record in payment.service:", error);
    throw error;
  }
}

// Saves the payment provider transaction ID.
export async function setPaymentProviderId(
  paymentRecordId: string,
  providerId: string
) {
  try {
    await db
      .update(payments)
      .set({
        paymentIntentId: providerId,
        updatedAt: new Date(),
      } as any)
      .where(eq(payments.id, paymentRecordId));
  } catch (error) {
    console.error("Error setting payment provider ID:", error);
    throw error;
  }
}

// Retrieves the payment associated with a registration or application.
export async function getPaymentByRegistrationId(registrationIdOrAppId: string) {
  try {
    const conditions = [eq(payments.registrationId, registrationIdOrAppId)];
    if ((payments as any).applicationId) {
      conditions.push(eq((payments as any).applicationId, registrationIdOrAppId));
    }

    const [record] = await db
      .select()
      .from(payments)
      .where(or(...conditions))
      .limit(1);

    return record ?? null;
  } catch (error) {
    console.error("Error fetching payment record:", error);
    throw error;
  }
}

// Updates the payment status after gateway confirmation without removing the record.
export async function updatePaymentStatus(
  paymentRecordId: string,
<<<<<<< HEAD
  status: "paid" | "failed",
  paymentMethod?: string
=======
  status: "paid" | "failed" | "awaiting_payment"
>>>>>>> 74efdc55341de5125842f4ff292ec287390d5716
) {
  try {
    const [updated] = await db
      .update(payments)
      .set({
        paymentStatus: status,
<<<<<<< HEAD
        ...(paymentMethod ? { paymentMethod } : {}),
      })
      .where(eq(payments.id, paymentRecordId));
=======
        updatedAt: new Date(),
      } as any)
      .where(eq(payments.id, paymentRecordId))
      .returning();

    return updated;
>>>>>>> 74efdc55341de5125842f4ff292ec287390d5716
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
}