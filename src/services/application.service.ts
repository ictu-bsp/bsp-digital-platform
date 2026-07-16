//src/services/application.service.ts

import { db } from "@/db";
import { desc, eq } from "drizzle-orm";
import { scoutApplications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function submitApplication(data: {
  councilId: string;
  scoutingPosition: string;
  advancementRank: string;
  tenure: number;
  region: string;
  communityBased: boolean;
  sponsoringInstitution: string | null;
  requestedRegistrationYears: number;
}) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

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

      status: "PENDING",
    })
    .returning();

  return application;
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