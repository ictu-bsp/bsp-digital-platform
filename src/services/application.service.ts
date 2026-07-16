//src/services/application.service.ts

import { db } from "@/db";
import { desc, eq } from "drizzle-orm";
import { scoutApplications } from "@/db/schema";
import { scouts } from "@/db/schema/scouts";
import { registrations } from "@/db/schema/scout-registrations";
import { getCurrentUser } from "@/lib/auth/current-user";
import { councils } from "@/db/schema/councils";

// ─────────────────────────────────────────────────────────────
// PLACEHOLDER — BSP's real Membership ID sequencing scheme
// (Proposal 1: Region/Local Council–Based Series, e.g. "01-01-0001")
// is not finalized yet. Once Reuben/the client confirms the real
// region and council codes, replace the "00-00" prefix below with
// the actual region/council code lookup, and consider making
// scouts.membershipNumber a unique DB constraint.
// ─────────────────────────────────────────────────────────────
export async function generateMembershipNumber(): Promise<string> {
  let candidate = "";
  let isUnique = false;

  while (!isUnique) {
    const sequence = Math.floor(1 + Math.random() * 9999)
      .toString()
      .padStart(4, "0");
    candidate = `00-00-${sequence}`;

    const [existing] = await db
      .select()
      .from(scouts)
      .where(eq(scouts.membershipNumber, candidate))
      .limit(1);

    isUnique = !existing;
  }

  return candidate;
}

export async function submitApplication(data: {
  councilId: string;
  scoutingPosition: string;
  advancementRank: string;
  tenure: number;
  region: string;
  communityBased: boolean;
  sponsoringInstitution: string | null;
  requestedRegistrationYears: number;
  bloodType: string;
  address: string;
  telephone: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactNumber: string;
}) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // Known schema gap workaround (Option A): scoutApplications has no
  // columns for personal/emergency-contact info yet, so it's
  // JSON-serialized into remarks until Reuben adds real columns.
  const personalInfo = {
    bloodType: data.bloodType,
    address: data.address,
    telephone: data.telephone,
    emergencyContactName: data.emergencyContactName,
    emergencyContactRelationship: data.emergencyContactRelationship,
    emergencyContactNumber: data.emergencyContactNumber,
  };

  const [application] = await db
    .insert(scoutApplications)
    .values({
      userId: user.id,
      preferredCouncilId: data.councilId,

      scoutingPosition: data.scoutingPosition,
      advancementRank: data.advancementRank,
      tenure: data.tenure,
      region: data.region,
      communityBased: data.communityBased,
      sponsoringInstitution: data.sponsoringInstitution,

      requestedRegistrationYears:
        data.requestedRegistrationYears,

      remarks: JSON.stringify(personalInfo),

      status: "PENDING",
    })
    .returning();

  // ─────────────────────────────────────────────────────────────
  // TEMPORARY WORKAROUND — remove once Reuben implements the real
  // approval → scouts → scout_registrations flow.
  //
  // Nothing currently creates a `scouts` or `scout_registrations`
  // row anywhere in the codebase, but payments require a valid
  // scout_registrations.id (FK constraint). This creates minimal
  // placeholder rows so the payment wizard can be tested end-to-end
  // before the real admin-approval-triggered flow exists.
  // ─────────────────────────────────────────────────────────────

  let [scout] = await db
    .select()
    .from(scouts)
    .where(eq(scouts.userId, user.id))
    .limit(1);

  if (!scout) {
    [scout] = await db
      .insert(scouts)
      .values({
        userId: user.id,
        councilId: data.councilId,
        status: "PENDING",
      })
      .returning();
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(
    endDate.getFullYear() + data.requestedRegistrationYears
  );

  // Known schema gap workaround (Option A): serialize extra wizard
  // fields as JSON into remarks until Reuben adds real columns.
  const extraFields = {
    applicationId: application.id,
    scoutingPosition: data.scoutingPosition,
    advancementRank: data.advancementRank,
    tenure: data.tenure,
    region: data.region,
    sponsoringInstitution: data.sponsoringInstitution,
  };

  const [registration] = await db
    .insert(registrations)
    .values({
      scoutId: scout.id,
      registrationYears: data.requestedRegistrationYears,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      status: "pending",
      remarks: JSON.stringify(extraFields),
    })
    .returning();

  return registration;
}

export async function getApplicationByUser(
  userId: string
) {
  return await db.query.scoutApplications.findFirst({
    where: eq(scoutApplications.userId, userId),
    orderBy: desc(scoutApplications.createdAt),
  });
}

export async function getPendingApplications() {
  return await db.query.scoutApplications.findMany({
    where: eq(scoutApplications.status, "PENDING"),
    orderBy: desc(scoutApplications.createdAt),
  });
}

export async function approveApplication(
  applicationId: string,
  reviewerId: string
) {
  const [application] = await db
    .update(scoutApplications)
    .set({
      status: "APPROVED",
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(scoutApplications.id, applicationId))
    .returning();

  if (!application) {
    return application;
  }

  // Mirror the approval onto the scout's own record: mark them
  // verified/active and assign a membership number if they don't
  // already have one (e.g. re-approval after a prior rejection
  // should keep their existing number — "Retainment of ID Number").
  const [scout] = await db
    .select()
    .from(scouts)
    .where(eq(scouts.userId, application.userId))
    .limit(1);

  if (scout) {
    const membershipNumber =
      scout.membershipNumber ?? (await generateMembershipNumber());

    await db
      .update(scouts)
      .set({
        status: "ACTIVE",
        verificationStatus: "active",
        membershipNumber,
        approvedBy: reviewerId,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(scouts.id, scout.id));
  }

  return application;
}

export async function rejectApplication(
  applicationId: string,
  reviewerId: string,
  remarks: string
) {
  const [application] = await db
    .update(scoutApplications)
    .set({
      status: "REJECTED",
      remarks,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(scoutApplications.id, applicationId))
    .returning();

  return application;
}

export async function cancelApplication(
  applicationId: string
) {
  const [application] = await db
    .update(scoutApplications)
    .set({
      status: "CANCELLED",
      updatedAt: new Date(),
    })
    .where(eq(scoutApplications.id, applicationId))
    .returning();

  return application;
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

export async function getMembershipCardData(userId: string) {
  const [scout] = await db
    .select()
    .from(scouts)
    .where(eq(scouts.userId, userId))
    .limit(1);

  if (!scout) {
    return null;
  }

  // scoutApplications may not exist for legacy registrations created via
  // the older createRegistrationAction flow (before this application-based
  // flow existed) — treat it as optional supplementary data.
  const application = await getLatestApplication(userId);

  const [registration] = await db
    .select()
    .from(registrations)
    .where(eq(registrations.scoutId, scout.id))
    .orderBy(desc(registrations.createdAt))
    .limit(1);

  // Use scout.councilId directly rather than application.preferredCouncilId
  // — scouts always has a council, applications may not exist at all.
  const [council] = await db
    .select()
    .from(councils)
    .where(eq(councils.id, scout.councilId))
    .limit(1);

  // Personal-info JSON may live on scoutApplications.remarks (new flow) or
  // registrations.remarks (legacy flow only has scoutingPosition/rank/etc,
  // no bloodType/emergency contact — those fields just won't be present).
  let personalInfo: {
    bloodType?: string;
    address?: string;
    telephone?: string;
    emergencyContactName?: string;
    emergencyContactRelationship?: string;
    emergencyContactNumber?: string;
    scoutingPosition?: string;
  } = {};

  const remarksSource = application?.remarks ?? registration?.remarks;

  if (remarksSource) {
    try {
      personalInfo = JSON.parse(remarksSource);
    } catch {
      personalInfo = {};
    }
  }

  return {
    application: application ?? null,
    scout,
    registration: registration ?? null,
    council: council ?? null,
    personalInfo,
  };
}