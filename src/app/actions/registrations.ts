// src/app/actions/registrations.ts
'use server';

import { getCurrentUser } from "@/lib/auth/current-user";
import { getScoutByUserId, createScout } from "@/services/scout.service";
import { createRegistration } from "@/services/registration.service";

export async function createRegistrationAction(input: {
  registrationYears: number;
  scoutingPosition: string;
  advancementRank: string;
  tenure: string;
  region: string;
  sponsoringInstitution: string;
  councilId: string;
}) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: "You must be logged in to register.",
      };
    }

    let scout = await getScoutByUserId(user.id);

    if (!scout) {
      scout = await createScout({
        userId: user.id,
        councilId: input.councilId,
      });
    }

    const registration = await createRegistration({
      scoutId: scout.id,
      ...input,
    });

    return {
      success: true,
      data: registration,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: "Failed to create registration.",
    };
  }
}