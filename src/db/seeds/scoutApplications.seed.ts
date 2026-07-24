// src/db/seeds/scoutApplications.seed.ts

import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../schema";
import { scoutApplications } from "@/db/schema/scoutApplications";

export async function seedScoutApplications(
  db: NodePgDatabase<typeof schema>
) {
  // Scout User
  const marc = await db.query.users.findFirst({
    where: eq(
      schema.users.email,
      "mjs.testscout2@bsp.ph"
    ),
  });

  // Preferred Council
  const council = await db.query.councils.findFirst();

  // Reviewer
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
    advancementRank: "Boy Scout",
    tenure: 5,

    // Location
    region: "National Capital Region",

    // Membership
    communityBased: false,
    sponsoringInstitution: "School",
    requestedRegistrationYears: 1,

    // Personal Information
    bloodType: "O+",
    address: "123 Scout Street, Quezon City, Metro Manila",
    telephoneNumber: "09171234567",

    // Emergency Contact
    emergencyContactName: "Maria James",
    emergencyContactRelationship: "Mother",
    emergencyContactNumber: "09179876543",

    // Review
    remarks: "Automatically approved by seed.",
    status: "APPROVED",
    reviewedBy: superAdmin.id,
    reviewedAt: new Date(),

    // createdAt / updatedAt / id
    // supplied automatically by the schema
  });

  console.log("✅ Scout Application seeded");
}