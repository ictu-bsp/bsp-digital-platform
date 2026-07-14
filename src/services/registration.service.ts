// src/services/registration.service.ts

import { db } from "@/db";
import { registrations } from "@/db/schema";

export type CreateRegistrationInput = {
  scoutId: string;
  registrationYears: number;
  scoutingPosition: string;
  advancementRank: string;
  tenure: string;
  region: string;
  sponsoringInstitution: string;
};

function formatDate(date: Date): string {
  // registrations.startDate / endDate are `date` columns without
  // { mode: "date" }, so Drizzle expects a "YYYY-MM-DD" string, not a Date object.
  return date.toISOString().split("T")[0];
}

export async function createRegistration(input: CreateRegistrationInput) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + input.registrationYears);

  const remarks = JSON.stringify({
    scoutingPosition: input.scoutingPosition,
    advancementRank: input.advancementRank,
    tenure: input.tenure,
    region: input.region,
    sponsoringInstitution: input.sponsoringInstitution,
  });

  const [record] = await db
    .insert(registrations)
    .values({
      scoutId: input.scoutId,
      registrationYears: input.registrationYears,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      status: "pending",
      remarks,
    })
    .returning();

  return record;
}