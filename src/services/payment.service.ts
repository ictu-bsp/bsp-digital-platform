// src/services/payment.service.ts

import { db } from "@/db";
import { eq, or } from "drizzle-orm";
import { payments, registrations, scoutApplications, scouts } from "@/db/schema";
import { resolveScoutSection, type ScoutSection } from "@/lib/utils/scout-section";

function resolveApplicationSection(
  scoutingPosition?: string | null | undefined,
  advancementRank?: string | null | undefined
): ScoutSection {
  // scoutingPosition is the reliable, controlled value (always one of
  // kid_scout | kab_scout | boy_scout | senior_scout | rover, derived
  // from the applicant's age bracket in SCOUT_SECTION_AGE_BRACKETS).
  // advancementRank is a real advancement-rank enum value (e.g.
  // "TENDERFOOT_SCOUT") and usually won't contain a section keyword at
  // all, especially for Senior/Rover progression ranks -- so it must NOT
  // take priority over scoutingPosition, only serve as a fallback when
  // scoutingPosition is missing entirely (e.g. legacy rows).
  return (
    resolveScoutSection(scoutingPosition) ??
    resolveScoutSection(advancementRank) ??
    "BOY"
  );
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

      const resolvedSection = resolveApplicationSection(
        application.scoutingPosition,
        application.advancementRank
      );
      const resolvedAdvancementRank = application.advancementRank ?? null;

      // Create or sync the scout profile using the application's actual information.
      if (!scout) {
        [scout] = await db
          .insert(scouts)
          .values({
            userId: application.userId,
            councilId: application.preferredCouncilId,

            // Preserve the applicant's selected section instead of using default "KID".
            section: resolvedSection,
            advancementRank: resolvedAdvancementRank,

            // Newly created scouts remain pending until approval.
            status: "PENDING",
          } as typeof scouts.$inferInsert)
          .returning();
      } else if (
        (scout as any).section !== resolvedSection ||
        (scout as any).advancementRank !== resolvedAdvancementRank
      ) {
        const [updatedScout] = await db
          .update(scouts)
          .set({
            section: resolvedSection,
            advancementRank: resolvedAdvancementRank,
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
      if (targetApplicationId) {
        conditions.push(eq(payments.applicationId, targetApplicationId));
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
      if (targetApplicationId && !existingPayment.applicationId) {
        await db
          .update(payments)
          .set({
            applicationId: targetApplicationId,
            updatedAt: new Date(),
          })
          .where(eq(payments.id, existingPayment.id));
      }
      return existingPayment;
    }

    // Create a new payment record.
    const paymentPayload: typeof payments.$inferInsert = {
      registrationId: targetRegistrationId,
      applicationId: targetApplicationId,
      paymentStatus: "awaiting_payment",
    };

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
    const [record] = await db
      .select()
      .from(payments)
      .where(
        or(
          eq(payments.registrationId, registrationIdOrAppId),
          eq(payments.applicationId, registrationIdOrAppId)
        )
      )
      .limit(1);

    return record ?? null;
  } catch (error) {
    console.error("Error fetching payment record:", error);
    throw error;
  }
}

// Updates the payment status after gateway confirmation without removing the record.
// paymentMethod is optional and only written when provided (e.g. from the
// GCash/GrabPay webhook's data.attributes.data.attributes.source?.type),
// so existing rows/callers that don't pass it are unaffected.
export async function updatePaymentStatus(
  paymentRecordId: string,
  status: "paid" | "failed" | "awaiting_payment",
  paymentMethod?: string
) {
  try {
    const [updated] = await db
      .update(payments)
      .set({
        paymentStatus: status,
        ...(paymentMethod ? { paymentMethod } : {}),
        updatedAt: new Date(),
      } as any)
      .where(eq(payments.id, paymentRecordId))
      .returning();

    return updated;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
}