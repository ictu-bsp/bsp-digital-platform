// src/services/payment.service.ts

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { payments, registrations, scoutApplications, scouts } from "@/db/schema";


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

    // 1. Check if the provided ID is an Application ID instead of a Registration ID
    const [application] = await db
      .select()
      .from(scoutApplications)
      .where(eq(scoutApplications.id, registrationId))
      .limit(1);

    if (application) {
      // Step A: Ensure a scout record exists for this user first
      let [scout] = await db
        .select()
        .from(scouts)
        .where(eq(scouts.userId, application.userId))
        .limit(1);

      if (!scout) {
        // Create scout entry if it doesn't exist yet
        const resolvedRank = SCOUTING_POSITION_TO_RANK[application.scoutingPosition ?? ""];

        [scout] = await db
          .insert(scouts)
          .values({
            userId: application.userId,
            councilId: application.preferredCouncilId,
            ...(resolvedRank ? { rank: resolvedRank } : {}),
          })
          .returning();
      }

      // Step B: Look for an existing registration record using scout.id (NOT application.userId)
      const [existingRegistration] = await db
        .select()
        .from(registrations)
        .where(eq(registrations.scoutId, scout.id))
        .limit(1);

      if (existingRegistration) {
        targetRegistrationId = existingRegistration.id;
      } else {
        // Step C: Calculate start and end dates ("YYYY-MM-DD")
        const now = new Date();
        const startDate = now.toISOString().split("T")[0];

        const yearsToAdd = application.requestedRegistrationYears ?? 1;
        const endDateObj = new Date(now);
        endDateObj.setFullYear(endDateObj.getFullYear() + yearsToAdd);
        const endDate = endDateObj.toISOString().split("T")[0];

        // Step D: Insert the pending registration record
        const [newRegistration] = await db
          .insert(registrations)
          .values({
            scoutId: scout.id,
            councilId: application.preferredCouncilId,
            startDate: startDate,
            endDate: endDate,
            registrationYears: yearsToAdd,
            status: "pending",
          })
          .returning();

        targetRegistrationId = newRegistration.id;
      }
    }

    // 2. Insert payment record referencing the verified registration ID
    const [record] = await db
      .insert(payments)
      .values({
        registrationId: targetRegistrationId,
        paymentStatus: "awaiting_payment",
      })
      .returning();

    return record;
  } catch (error) {
    console.error("Error creating payment record in payment.service:", error);
    throw error;
  }
}

export async function setPaymentProviderId(
  paymentRecordId: string,
  providerId: string
) {
  try {
    await db
      .update(payments)
      .set({ paymentIntentId: providerId })
      .where(eq(payments.id, paymentRecordId));
  } catch (error) {
    console.error("Error setting payment provider ID:", error);
    throw error;
  }
}

export async function getPaymentByRegistrationId(registrationId: string) {
  try {
    const [record] = await db
      .select()
      .from(payments)
      .where(eq(payments.registrationId, registrationId));

    return record ?? null;
  } catch (error) {
    console.error("Error fetching payment by registration ID:", error);
    throw error;
  }
}

export async function updatePaymentStatus(
  paymentRecordId: string,
  status: "paid" | "failed",
  paymentMethod?: string
) {
  try {
    await db
      .update(payments)
      .set({
        paymentStatus: status,
        ...(paymentMethod ? { paymentMethod } : {}),
      })
      .where(eq(payments.id, paymentRecordId));
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
}