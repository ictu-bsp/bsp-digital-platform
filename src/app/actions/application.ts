// src/app/actions/application.ts
"use server";

import { getCurrentUser } from "@/lib/auth/current-user";
import {
  submitApplication,
  getLatestApplication,
} from "@/services/application.service";

export interface SubmitApplicationActionInput {
  councilId?: string;
  preferredCouncilId?: string;
  scoutingPosition: string;
  advancementRank: string;
  tenure: number;
  region: string;
  communityBased: boolean;
  sponsoringInstitution: string | null;
  requestedRegistrationYears: number;
  bloodType: string;
  address: string;
  telephone?: string;
  telephoneNumber?: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactNumber: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  nameExtension?: string;
  birthday?: string;
  mobileNumber?: string;
  gender?: string;
  civilStatus?: string;
  profession?: string;
  positionTitle?: string;
}

export async function submitApplicationAction(data: SubmitApplicationActionInput) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "Unauthorized: You must be logged in to submit an application.",
      };
    }

    // Map incoming action data cleanly to service expectations
    const payload = {
      ...data,
      userId: user.id,
      preferredCouncilId: data.councilId || data.preferredCouncilId || null,
      telephoneNumber: data.telephone || data.telephoneNumber || null,
      sponsoringInstitution: data.sponsoringInstitution,
    };

    const application = await submitApplication(payload);

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
          : "Application failed. Please try again later.",
    };
  }
}

export async function getLatestApplicationAction() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return null;
    }

    return await getLatestApplication(user.id);
  } catch (error) {
    console.error("Failed to fetch latest application:", error);
    return null;
  }
}