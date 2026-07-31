// src/app/actions/registrations.ts
'use server';
import { getCurrentUser } from "@/lib/auth/current-user";
import { getScoutByUserId, createScout } from "@/services/scout.service";
import { createRegistration } from "@/services/registration.service";
// Creates a new registration record for the user, creating a scout profile first if one does not exist
export async function createRegistrationAction(input:
  { registrationYears: number; scoutingPosition: string; advancementRank: string;
    tenure: string; region: string; sponsoringInstitution: string; councilId: string; }) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "You must be logged in to register." };
    let scout = await getScoutByUserId(user.id);
    // TODO: advancementRank ("scout" | "first_class" | "eagle") from the wizard
    // does not yet map to scouts.rank enum ("KID"|"KAB"|"BOY"|"SENIOR"|"ROVER").
    // Hardcoding "KID" as a temp placeholder to unblock the build — confirm real
    // mapping with Reuben before this goes anywhere near production data.
    if (!scout) scout = await createScout({ userId: user.id, councilId: input.councilId, rank: "KID" });
    const registration = await createRegistration({ scoutId: scout.id, ...input });
    return { success: true, data: registration };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to create registration." };
  }
}