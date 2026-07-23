// src/services/application.service.ts

import { db } from "@/db";
import { desc, eq, count, and, gte, lte } from "drizzle-orm";
import { scoutApplications } from "@/db/schema";
import { scouts } from "@/db/schema/scouts";
import { registrations } from "@/db/schema/scout-registrations";
import { councils } from "@/db/schema/councils";
import { regions } from "@/db/schema/regions";
import { getCurrentUser } from "@/lib/auth/current-user";

export interface SubmitApplicationInput {
  userId?: string | null;
  preferredCouncilId?: string | null;
  councilId?: string | null;
  scoutingPosition?: string | null;
  advancementRank?: string | null;
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
  [key: string]: any;
}

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
  const preferredCouncilId =
    rawCouncil && String(rawCouncil).trim() !== "" ? String(rawCouncil) : null;

  const insertPayload = {
    userId: userId,
    preferredCouncilId: preferredCouncilId,
    scoutingPosition: data.scoutingPosition ? String(data.scoutingPosition) : null,
    advancementRank: data.advancementRank ? String(data.advancementRank) : null,
    tenure:
      data.tenure !== undefined && data.tenure !== null && data.tenure !== ""
        ? Number(data.tenure)
        : 0,
    region: data.region ? String(data.region) : null,
    communityBased:
      data.communityBased === true || data.communityBased === "true",
    sponsoringInstitution: data.sponsoringInstitution
      ? String(data.sponsoringInstitution)
      : null,
    requestedRegistrationYears: data.requestedRegistrationYears
      ? Number(data.requestedRegistrationYears)
      : 1,
    bloodType: data.bloodType ? String(data.bloodType) : null,
    address: data.address ? String(data.address) : null,
    telephoneNumber: data.telephoneNumber ? String(data.telephoneNumber) : null,
    emergencyContactName: data.emergencyContactName
      ? String(data.emergencyContactName)
      : null,
    emergencyContactRelationship: data.emergencyContactRelationship
      ? String(data.emergencyContactRelationship)
      : null,
    emergencyContactNumber: data.emergencyContactNumber
      ? String(data.emergencyContactNumber)
      : null,
    remarks: data.remarks ? String(data.remarks) : null,
    status: data.status ? String(data.status).toUpperCase() : "PENDING",
  };

  const [inserted] = await db
    .insert(scoutApplications)
    .values(insertPayload as typeof scoutApplications.$inferInsert)
    .returning();

  return inserted;
}

// Fetches all applications submitted by a user (the full history)
export async function getApplicationByUser(userId: string) {
  const applications = await db
    .select()
    .from(scoutApplications)
    .where(eq(scoutApplications.userId, userId))
    .orderBy(desc(scoutApplications.createdAt));

  return applications;
}

// Fetches specifically the most recent application by leveraging the user's application history
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

  if (!scout) {
    return null;
  }

  const application = await getLatestApplication(userId);

  const [registration] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.scoutId, scout.id))
    .orderBy(desc(registrations.createdAt))
    .limit(1);

  const [council] = await db
    .select()
    .from(councils)
    .where(eq(councils.id, scout.councilId))
    .limit(1);

  return {
    application: application ?? null,
    scout: scout
      ? {
          ...scout,
          bloodType: application?.bloodType ?? "",
          address: application?.address ?? "",
          telephoneNumber: application?.telephoneNumber ?? "",
          emergencyContactName: application?.emergencyContactName ?? "",
          emergencyContactRelationship:
            application?.emergencyContactRelationship ?? "",
          emergencyContactNumber: application?.emergencyContactNumber ?? "",
        }
      : null,
    registration: registration ?? null,
    council: council ?? null,
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

  const membershipId = await generateMembershipNumber(
    councilRecord.regionNumber,
    councilRecord.councilNumber,
    nextOrderNumber
  );

  return membershipId;
}

export async function approveScoutApplication(applicationId: string, adminId: string) {
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

  const membershipId = await assignMembershipIdToScout(
    application.userId, 
    councilId
  );

  await db.transaction(async (tx) => {
    await tx
      .update(scoutApplications)
      .set({
        status: "APPROVED",
        reviewedBy: adminId,
        reviewedAt: new Date(),
      })
      .where(eq(scoutApplications.id, applicationId));

    await tx
      .update(scouts)
      .set({
        councilId: councilId,
      })
      .where(eq(scouts.userId, application.userId));
  });

  return { success: true, membershipId };
}