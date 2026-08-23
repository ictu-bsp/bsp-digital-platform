// src/services/application.service.ts

import { db } from "@/db";
import { desc, eq, count, and, gte, lte, sql} from "drizzle-orm";
import { scoutApplications, users } from "@/db/schema";
import { scouts } from "@/db/schema/scouts";
import { registrations } from "@/db/schema/scout-registrations";
import { councils, nationalSequences } from "@/db/schema/councils";
import { regions } from "@/db/schema/regions";
import { payments } from "@/db/schema/payments";
import { getCurrentUser } from "@/lib/auth/current-user";
import { resolveScoutSection, type ScoutSection } from "@/lib/utils/scout-section";

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

// ---------------------------------------------------------
// Helper Utilities & Generator Functions (Defined first)
// ---------------------------------------------------------

export function resolveScoutSectionEnum(
  sectionInput?: string | null,
  positionInput?: string | null
): ScoutSection | null {
  return resolveScoutSection(sectionInput) ?? resolveScoutSection(positionInput);
}

export const cleanValue = (val?: unknown): string | null => {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed === "" ? null : trimmed;
};

const NATIONAL_SEQUENCE_KEY = "SCOUT_MEMBERSHIP_NATIONAL";

/**
 * Formats the Membership ID as: <Year Prefix>-<Council Number>-<8-digit national sequence>
 * Example: 23-05-00000003
 */
export function generateMembershipNumber(
  councilCode: string | number,
  orderNumber: number | string
): string {
  const yearPrefix = String(new Date().getFullYear()).slice(-2);
  const council = String(councilCode).trim();
  const sequence = String(orderNumber).padStart(8, "0");
  return `${yearPrefix}-${council}-${sequence}`;
}

/**
 * Atomically increments the national sequence counter and formats the full Membership ID.
 */
export async function assignMembershipIdToScout(
  scoutId: string,
  councilId: string,
  txClient: any = db
) {
  // 1. Fetch the scout's specific council code
  const [councilRecord] = await txClient
    .select({
      id: councils.id,
      councilNumber: councils.councilNumber,
    })
    .from(councils)
    .where(eq(councils.id, councilId))
    .limit(1);

  if (!councilRecord) {
    throw new Error("Council not found.");
  }

  const councilCode = councilRecord.councilNumber || "00";

  // 2. Atomically increment the single national sequence
  const [seqRecord] = await txClient
    .insert(nationalSequences)
    .values({
      id: NATIONAL_SEQUENCE_KEY,
      lastSequence: 1,
    })
    .onConflictDoUpdate({
      target: nationalSequences.id,
      set: {
        lastSequence: sql`${nationalSequences.lastSequence} + 1`,
      },
    })
    .returning({ sequence: nationalSequences.lastSequence });

  const nationalOrderNumber = seqRecord.sequence;

  // 3. Format ID: YY-COUNCIL-00000000
  return generateMembershipNumber(councilCode, nationalOrderNumber);
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
    })
    .where(eq(payments.id, paymentId));
}

// ---------------------------------------------------------
// Core Application Query & Submission Handlers
// ---------------------------------------------------------

export async function submitApplication(data: SubmitApplicationInput) {
  let userId = data.userId;
  if (!userId) {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error("Unauthorized: User session required to submit an application.");
    }
    userId = user.id;
  }

  const rawCouncil = data.preferredCouncilId || data.councilId;
  const preferredCouncilId = cleanValue(rawCouncil);

  const mappedSection = resolveScoutSectionEnum(data.scoutSection, data.scoutingPosition);
  const isCommunity = data.communityBased === true || data.communityBased === "true";
  const sponsoringInstitution = isCommunity ? null : cleanValue(data.sponsoringInstitution);
  const years = Number(data.requestedRegistrationYears) || 1;

  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setFullYear(now.getFullYear() + years);

  const startDateStr = now.toISOString().split("T")[0];
  const endDateStr = expiresAt.toISOString().split("T")[0];

  const insertPayload = {
    userId: userId,
    preferredCouncilId: preferredCouncilId,
    scoutingPosition: cleanValue(data.scoutingPosition),
    scoutSection: mappedSection,
    advancementRank: cleanValue(data.advancementRank),
    tenure: data.tenure !== undefined && data.tenure !== null && data.tenure !== "" ? Number(data.tenure) : 0,
    region: cleanValue(data.region),
    communityBased: isCommunity,
    sponsoringInstitution: sponsoringInstitution,
    requestedRegistrationYears: years,
    bloodType: cleanValue(data.bloodType),
    address: cleanValue(data.address),
    telephoneNumber: cleanValue(data.telephoneNumber),
    emergencyContactName: cleanValue(data.emergencyContactName),
    emergencyContactRelationship: cleanValue(data.emergencyContactRelationship),
    emergencyContactNumber: cleanValue(data.emergencyContactNumber),
    remarks: cleanValue(data.remarks),
    status: "APPROVED" as const,
  };

  return await db.transaction(async (tx) => {
  // 1. Insert Application marked as APPROVED
  const [inserted] = await tx
    .insert(scoutApplications)
    .values(insertPayload as typeof scoutApplications.$inferInsert)
    .returning();

  // 2. Fetch or Create Scout Profile
  const [existingScout] = await tx
    .select()
    .from(scouts)
    .where(eq(scouts.userId, userId))
    .limit(1);

  let membershipId = existingScout?.membershipNumber;
  if (!membershipId && preferredCouncilId) {
    // Pass 'tx' to lock and increment the sequence atomically
    membershipId = await assignMembershipIdToScout(
      existingScout?.id || "temp",
      preferredCouncilId,
      tx
    );
  }

  let scoutRecord;

  if (existingScout) {
    const [updated] = await tx
      .update(scouts)
      .set({
        ...(preferredCouncilId ? { councilId: preferredCouncilId } : {}),
        membershipNumber: membershipId || existingScout.membershipNumber,
        section: (mappedSection as any) ?? existingScout.section ?? "BOY",
        advancementRank:
          (cleanValue(data.advancementRank) as any) ??
          existingScout.advancementRank,
        status: "ACTIVE",
        verificationStatus: "active",
        approvedAt: now,
        updatedAt: now,
      })
      .where(eq(scouts.id, existingScout.id))
      .returning();
    scoutRecord = updated;
  } else {
    const [created] = await tx
      .insert(scouts)
      .values({
        userId: userId,
        councilId: preferredCouncilId || "",
        membershipNumber: membershipId || null,
        section: (mappedSection as any) ?? "BOY",
        advancementRank:
          (cleanValue(data.advancementRank) as any) ?? undefined,
        status: "ACTIVE",
        verificationStatus: "active",
        approvedAt: now,
      } as any)
      .returning();
    scoutRecord = created;
  }

  // 3. Insert Active Registration Record
  if (scoutRecord?.id) {
    await tx.insert(registrations).values({
      scoutId: scoutRecord.id,
      startDate: startDateStr,
      endDate: endDateStr,
      registrationYears: years,
      status: "active",
    } as any);
  }

  // 4. Update core user role to SCOUT
  await tx
    .update(users)
    .set({ role: "SCOUT", updatedAt: now })
    .where(eq(users.id, userId));

  // Return application data along with the generated membership number
  return {
    ...inserted,
    membershipNumber: membershipId || scoutRecord?.membershipNumber,
  };
});
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
  if (!currentUser) return null;

  const userId = currentUser.id;

  const [scout] = await db
    .select()
    .from(scouts)
    .where(eq(scouts.userId, userId))
    .limit(1);

  const application = await getLatestApplication(userId);
  if (!scout && !application) return null;

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
    (scout as any)?.section ||
    "Unassigned";

  const resolvedRank =
    application?.advancementRank ||
    scout?.advancementRank ||
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
  const resolvedSection =
    resolveScoutSectionEnum(application.scoutSection, application.scoutingPosition) ??
    "BOY";

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
        section: resolvedSection,
        advancementRank: application.advancementRank,
        status: "ACTIVE",
        verificationStatus: "active",
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(scouts.userId, application.userId));
  });

  return { success: true, membershipId };
}