// src/services/application.service.ts

import { db } from "@/db";
import { desc, eq } from "drizzle-orm";
import { scoutApplications } from "@/db/schema";
import { scouts } from "@/db/schema/scouts";
import { registrations } from "@/db/schema/scout-registrations";
import { councils } from "@/db/schema/councils";

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
  [key: string]: any; // Allows flexible form payloads
}

export async function submitApplication(data: SubmitApplicationInput) {
  // Resolve userId either from explicit payload or current active session
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

  // Handle council ID mapping from common form property variants
  const rawCouncil = data.preferredCouncilId || data.councilId;
  const preferredCouncilId =
    rawCouncil && String(rawCouncil).trim() !== "" ? String(rawCouncil) : null;

  // Build clean payload with explicit primitives and nulls
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

    // Convert status to UPPERCASE to match applicationStatusEnum ('PENDING', 'APPROVED', etc.)
    status: data.status ? String(data.status).toUpperCase() : "PENDING",
  };

  const [inserted] = await db
    .insert(scoutApplications)
    .values(insertPayload as typeof scoutApplications.$inferInsert)
    .returning();

  return inserted;
}

export async function getLatestApplication(userId: string) {
  const [application] = await db
    .select()
    .from(scoutApplications)
    .where(eq(scoutApplications.userId, userId))
    .orderBy(desc(scoutApplications.createdAt))
    .limit(1);

  return application ?? null;
}

export async function getApplicationByUser(userId: string) {
  const [application] = await db
    .select()
    .from(scoutApplications)
    .where(eq(scoutApplications.userId, userId))
    .orderBy(desc(scoutApplications.createdAt))
    .limit(1);

  return application ?? null;
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

export function generateMembershipNumber(
  regionNumber: string | number = "01",
  councilNumber: string | number = "001",
  userNumber: string | number = "0001"
): string {
  const year = new Date().getFullYear();

  const region = String(regionNumber).padStart(2, "0");
  const council = String(councilNumber).padStart(3, "0");
  const userSeq = String(userNumber).padStart(4, "0");
  const randomDigits = Math.floor(100 + Math.random() * 900);

  return `BSP-${year}-${region}-${council}-${userSeq}-${randomDigits}`;
}