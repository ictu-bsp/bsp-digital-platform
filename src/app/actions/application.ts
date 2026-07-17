//src/app/actions/applications.ts

"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import { submitApplication } from "@/services/application.service";
import { getLatestApplication } from "@/services/application.service";

export async function submitApplicationAction(data: {
  councilId: string;
  scoutingPosition: string;
  advancementRank: string;
  tenure: number;
  region: string;
  communityBased: boolean;
  sponsoringInstitution: string | null;
  requestedRegistrationYears: number;
  // Personal info fields â€” stored in scoutApplications' dedicated
  // columns (bloodType, address, telephoneNumber, etc.) by
  // submitApplication().
  bloodType: string;
  address: string;
  telephone: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactNumber: string;
}) {
  try {
    const application =
      await submitApplication(data);

    return {
      success: true,
      data: application,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Application failed.",
    };
  }
}

export async function getLatestApplicationAction() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return await getLatestApplication(user.id);
}