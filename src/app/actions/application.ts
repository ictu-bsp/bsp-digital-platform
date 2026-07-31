// src/app/actions/application.ts
"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { submitApplication, getLatestApplication, SubmitApplicationInput } from "@/services/application.service";

const cleanNull = (val?: unknown): string | null => {
  if (typeof val !== "string") return null;
  const trimmed = val.trim();
  return trimmed === "" ? null : trimmed;
};

export async function submitApplicationAction(data: SubmitApplicationInput) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        error: "Unauthorized: You must be logged in to submit an application.",
      };
    }

    const isCommunity = Boolean(data.communityBased);

    const payload: SubmitApplicationInput = {
      ...data,
      userId: user.id,
      preferredCouncilId: cleanNull(data.councilId) || cleanNull(data.preferredCouncilId),
      scoutSection: cleanNull(data.scoutSection) || cleanNull(data.scoutingPosition),
      scoutingPosition: cleanNull(data.scoutingPosition),
      advancementRank: cleanNull(data.advancementRank), // Retains raw text rank
      tenure: data.tenure !== undefined && data.tenure !== null && data.tenure !== "" ? Number(data.tenure) : 0,
      region: cleanNull(data.region),
      communityBased: isCommunity,
      sponsoringInstitution: isCommunity ? null : cleanNull(data.sponsoringInstitution), // Explicitly null for community-based
      requestedRegistrationYears: data.requestedRegistrationYears ? Number(data.requestedRegistrationYears) : 1,
      telephoneNumber: cleanNull(data.telephone) || cleanNull(data.telephoneNumber),
      bloodType: cleanNull(data.bloodType),
      address: cleanNull(data.address),
      emergencyContactName: cleanNull(data.emergencyContactName),
      emergencyContactRelationship: cleanNull(data.emergencyContactRelationship),
      emergencyContactNumber: cleanNull(data.emergencyContactNumber),
      remarks: cleanNull(data.remarks),
      status: "PENDING",
    };

    const application = await submitApplication(payload);
    return { success: true, data: application };
  } catch (error) {
    console.error("Application submission error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Application failed. Please try again later.",
    };
  }
}

export async function getLatestApplicationAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    return await getLatestApplication(user.id);
  } catch (error) {
    console.error("Failed to fetch latest application:", error);
    return null;
  }
}

