// src/services/application.service.ts

import { db } from "@/db";
import { desc, eq, count, and, gte, lte } from "drizzle-orm";
import { scoutApplications } from "@/db/schema";
import { scouts } from "@/db/schema/scouts";
import { registrations } from "@/db/schema/scout-registrations";
import { councils } from "@/db/schema/councils";
import { regions } from "@/db/schema/regions";
import { payments } from "@/db/schema/payments";
import { getCurrentUser } from "@/lib/auth/current-user";

export interface SubmitApplicationInput {
  userId?: string | null;
  preferredCouncilId?: string | null;
  councilId?: string | null;
  scoutingPosition?: string | null;
  advancementRank?: string | null;
  scoutSection?: string | null;
  tenure?: number | string | null;
  region?: string | null;
  communityBased?: boolean | string | null;
  sponsoringInstitution?: string | null;
  requestedRegistrationYears?: number | string | null;
  bloodType?: string | null;
  address?: string | null;
  telephoneNumber?: string | null;
  emergencyContactName?: string | null;
  emergencyContactRelationship?: string | null;
  emergencyContactNumber?: string | null;
  remarks?: string | null;
  status?: string | null;
  paymentId?: string | null;
  [key: string]: any;
}

// Maps section inputs to valid scoutSection Enum values ('KID' | 'KAB' | 'BOY' | 'SENIOR' | 'ROVER')
function resolveScoutSectionEnum(
  sectionInput?: string | null,
  positionInput?: string | null
): "KID" | "KAB" | "BOY" | "SENIOR" | "ROVER" | null {
  const value = (sectionInput || positionInput || "").toUpperCase().trim();

  if (value.includes("KID")) return "KID";
  if (value.includes("KAB")) return "KAB";
  if (value.includes("BOY")) return "BOY";
  if (value.includes("SENIOR")) return "SENIOR";
  if (value.includes("ROVER")) return "ROVER";

  return null;
}

// Helper to convert empty string inputs into real SQL NULL
const cleanValue = (val?: unknown): string | null => {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed === "" ? null : trimmed;
};

export async function submitApplication(data: SubmitApplicationInput) {
  let userId = data.userId;
  if (!userId) {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error(
        "Unauthorized: User session required to submit an application."
      );
    }
    userId = user.id;
  }

  const rawCouncil = data.preferredCouncilId || data.councilId;
  const preferredCouncilId = cleanValue(rawCouncil);

  // Map section to valid enum
  const mappedSection = resolveScoutSectionEnum(data.scoutSection, data.scoutingPosition);
  
  // Allow null for sponsoringInstitution if empty or if community-based
  const isCommunity = data.communityBased === true || data.communityBased === "true";
  const sponsoringInstitution = isCommunity ? null : cleanValue(data.sponsoringInstitution);

  const insertPayload = {
    userId: userId,
    preferredCouncilId: preferredCouncilId,
    scoutingPosition: cleanValue(data.scoutingPosition),
    scoutSection: mappedSection,
    advancementRank: cleanValue(data.advancementRank), // Accepts raw text ("Tenderfoot", "Eagle", etc.)
    tenure:
      data.tenure !== undefined && data.tenure !== null && data.tenure !== ""
        ? Number(data.tenure)
        : 0,
    region: cleanValue(data.region),
    communityBased: isCommunity,
    sponsoringInstitution: sponsoringInstitution,
    requestedRegistrationYears: data.requestedRegistrationYears
      ? Number(data.requestedRegistrationYears)
      : 1,
    bloodType: cleanValue(data.bloodType),
    address: cleanValue(data.address),
    telephoneNumber: cleanValue(data.telephoneNumber),
    emergencyContactName: cleanValue(data.emergencyContactName),
    emergencyContactRelationship: cleanValue(data.emergencyContactRelationship),
    emergencyContactNumber: cleanValue(data.emergencyContactNumber),
    remarks: cleanValue(data.remarks),
    status: data.status ? (String(data.status).toUpperCase() as "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED") : "PENDING",
  };

  const [inserted] = await db
    .insert(scoutApplications)
    .values(insertPayload as typeof scoutApplications.$inferInsert)
    .returning();

  if (data.paymentId && inserted?.id) {
    await linkPaymentToApplication(data.paymentId, inserted.id);
  }

  return inserted;
}

// Fetches all applications submitted by a user
export async function getApplicationByUser(userId: string) {
  const applications = await db
    .select()
    .from(scoutApplications)
    .where(eq(scoutApplications.userId, userId))
    .orderBy(desc(scoutApplications.createdAt));

  return applications;
}

// Fetches the most recent application
export async function getLatestApplication(userId: string) {
  const applications = await getApplicationByUser(userId);
  return applications[0] ?? null;
}

export async function getMembershipCardData() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return null;
  }

  const userId = currentUser.id;

  const [scout] = await db
    .select()
    .from(scouts)
    .where(eq(scouts.userId, userId))
    .limit(1);

  const application = await getLatestApplication(userId);

  if (!scout && !application) {
    return null;
  }

  const scoutId = scout?.id ?? null;

  let registration = null;
  if (scoutId) {
    const [regRecord] = await db
      .select()
      .from(registrations)
      .where(eq(registrations.scoutId, scoutId))
      .orderBy(desc(registrations.createdAt))
      .limit(1);
    registration = regRecord ?? null;
  }

  const councilId = scout?.councilId || application?.preferredCouncilId || null;
  let council = null;
  if (councilId) {
    const [councilRecord] = await db
      .select()
      .from(councils)
      .where(eq(councils.id, councilId))
      .limit(1);
    council = councilRecord ?? null;
  }

  const resolvedSection =
    application?.scoutSection ||
    application?.scoutingPosition ||
    (scout as any)?.scoutSection ||
    "Unassigned";

  const resolvedRank =
    application?.advancementRank ||
    scout?.rank ||
    (scout as any)?.advancementRank ||
    "Unranked";

  return {
    application: application ?? null,
    scout: {
      ...(scout || {}),
      bloodType: application?.bloodType || (scout as any)?.bloodType || "N/A",
      address: application?.address || (scout as any)?.address || "N/A",
      telephoneNumber:
        application?.telephoneNumber || (scout as any)?.telephoneNumber || "N/A",
      emergencyContactName:
        application?.emergencyContactName ||
        (scout as any)?.emergencyContactName ||
        "N/A",
      emergencyContactRelationship:
        application?.emergencyContactRelationship ||
        (scout as any)?.emergencyContactRelationship ||
        "N/A",
      emergencyContactNumber:
        application?.emergencyContactNumber ||
        (scout as any)?.emergencyContactNumber ||
        "N/A",
      scoutSection: resolvedSection,
      advancementRank: resolvedRank,
    },
    registration: registration,
    council: council,
  };
}

export async function generateMembershipNumber(
  regionNumber: string,
  councilNumber: string,
  orderNumber: number | string
): Promise<string> {
  const year = new Date().getFullYear();
  const region = String(regionNumber).padStart(2, "0");
  const council = String(councilNumber).padStart(2, "0");
  const seq = String(orderNumber).padStart(4, "0");
  const randomDigits = Math.floor(1000 + Math.random() * 9000);

  return `${year}-${region}-${council}-${seq}-${randomDigits}`;
}

export async function assignMembershipIdToScout(scoutId: string, councilId: string) {
  const [councilRecord] = await db
    .select({
      councilNumber: councils.councilNumber,
      regionNumber: regions.regionNumber,
    })
    .from(councils)
    .innerJoin(regions, eq(councils.regionId, regions.id))
    .where(eq(councils.id, councilId))
    .limit(1);

  if (!councilRecord) {
    throw new Error("Council or associated Region not found.");
  }

  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

  const [result] = await db
    .select({ value: count() })
    .from(registrations)
    .innerJoin(scouts, eq(registrations.scoutId, scouts.id))
    .where(
      and(
        eq(scouts.councilId, councilId),
        gte(registrations.createdAt, startOfYear),
        lte(registrations.createdAt, endOfYear)
      )
    );

  const nextOrderNumber = (result?.value || 0) + 1;

  return await generateMembershipNumber(
    councilRecord.regionNumber,
    councilRecord.councilNumber,
    nextOrderNumber
  );
}

export async function linkPaymentToApplication(
  paymentId: string,
  applicationId: string
) {
  await db
    .update(payments)
    .set({
      applicationId: applicationId,
      updatedAt: new Date(),
    } as any)
    .where(eq(payments.id, paymentId));
}

export async function approveScoutApplication(
  applicationId: string,
  adminId: string
) {
  const [application] = await db
    .select()
    .from(scoutApplications)
    .where(eq(scoutApplications.id, applicationId))
    .limit(1);

  if (!application) {
    throw new Error("Application not found.");
  }

  if (application.status === "APPROVED") {
    throw new Error("Application is already approved.");
  }

  const councilId = application.preferredCouncilId;
  if (!councilId) {
    throw new Error("Application does not specify a valid council ID.");
  }

  const [scout] = await db
    .select({ id: scouts.id })
    .from(scouts)
    .where(eq(scouts.userId, application.userId))
    .limit(1);

  if (!scout) {
    throw new Error("Scout profile record not found for this user.");
  }

  const membershipId = await assignMembershipIdToScout(scout.id, councilId);

  await db.transaction(async (tx) => {
    await tx
      .update(scoutApplications)
      .set({
        status: "APPROVED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(scoutApplications.id, applicationId));

    await tx
      .update(scouts)
      .set({
        councilId: councilId,
        membershipNumber: membershipId,
        rank: application.advancementRank as any,
        scoutSection: application.scoutSection,
        status: "ACTIVE",
        verificationStatus: "active",
        approvedAt: new Date(),
        updatedAt: new Date(),
      } as any)
      .where(eq(scouts.userId, application.userId));
  });

  return { success: true, membershipId };
}