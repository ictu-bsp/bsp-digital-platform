// src/db/seeds/scoutApplications.seed.ts

import { scoutApplications } from "@/db/schema/scoutApplications";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import * as schema from "../schema";

export async function seedScoutApplications(
  db: NodePgDatabase<typeof schema>
) {
  // Marc James
  const marc = await db.query.users.findFirst({
    where: eq(
      schema.users.email,
      "mjs.testscout2@bsp.ph"
    ),
  });

  // BSP Council
  const council = await db.query.councils.findFirst();

  // Super Admin (reviewer)
  const superAdmin = await db.query.users.findFirst({
    where: eq(
      schema.users.role,
      "SUPER_ADMIN"
    ),
  });

  if (!marc) {
    throw new Error("Marc James not found.");
  }

  if (!council) {
    throw new Error("Council not found.");
  }

  if (!superAdmin) {
    throw new Error("Super Admin not found.");
  }

  await db.insert(scoutApplications).values({
    // Foreign Keys
    userId: marc.id,
    preferredCouncilId: council.id,

    // Scout Information
    scoutingPosition: "Scout",
    advancementRank: "Kid Scout",
    tenure: 1,

    // Location
    region: "National Capital Region",

    // Institution
    communityBased: false,
    sponsoringInstitution: "Adventist School",

    // Registration
    requestedRegistrationYears: 1,

    // Review
    remarks: "Automatically approved by seed.",
    status: "APPROVED",
    reviewedBy: superAdmin.id,
    reviewedAt: new Date(),

    // id, createdAt and updatedAt are omitted
    // because the schema already supplies defaults.
  });

  console.log("✅ Scout Application seeded");
}