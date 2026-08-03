// src/app/actions/registrations.ts
'use server';
import { getCurrentUser } from "@/lib/auth/current-user";
import { getScoutByUserId, createScout } from "@/services/scout.service";
import { createRegistration } from "@/services/registration.service";
import { resolveScoutSection } from "@/lib/utils/scout-section";
// Creates a new registration record for the user, creating a scout profile first if one does not exist
export async function createRegistrationAction(input:
  { registrationYears: number; scoutingPosition: string; advancementRank: string;
    tenure: string; region: string; sponsoringInstitution: string; councilId: string; }) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "You must be logged in to register." };
    let scout = await getScoutByUserId(user.id);
    // Resolve the actual section from whatever the wizard collected (section
    // dropdown first, falls back to advancementRank if that's all we have).
    const section = resolveScoutSection(input.scoutingPosition) ?? resolveScoutSection(input.advancementRank) ?? "KID";
    if (!scout) scout = await createScout({ userId: user.id, councilId: input.councilId, section });
    const registration = await createRegistration({ scoutId: scout.id, ...input });
    return { success: true, data: registration };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create registration." };
  }
}