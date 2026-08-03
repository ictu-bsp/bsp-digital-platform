// src/db/seeds/scouts.seed.ts

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";

import * as schema from "../schema";

export async function seedScouts(
  db: NodePgDatabase<typeof schema>
) {
  const marc = await db.query.users.findFirst({
    where: eq(
      schema.users.email,
      "mjs.testscout2@bsp.ph"
    ),
  });

  const council = await db.query.councils.findFirst();

  if (!marc || !council) {
    throw new Error(
      "Marc James or Council could not be found while seeding scouts."
    );
  }

  // Idempotency check: verify if the scout profile already exists
  const existingScout = await db.query.scouts.findFirst({
    where: eq(schema.scouts.userId, marc.id),
  });

  if (!existingScout) {
    await db.insert(schema.scouts).values({
      userId: marc.id,

      councilId: council.id,

      membershipNumber: "2026-00-00-0001-6967",

      // Must be a valid scout_section enum value: "KID" | "KAB" | "BOY" | "SENIOR" | "ROVER"
      section: "BOY",

      // Must be a valid scout_advancement_rank enum value for the BOY section.
      advancementRank: "SECOND_CLASS_SCOUT",

      status: "ACTIVE",

      verificationStatus: "active",

      joinedAt: new Date(),

      approvedBy: null,

      approvedAt: new Date(),

      isActive: true,
    });

    console.log("✅ Seeded scout profile.");
  } else {
    console.log("⚠️ Scout profile already exists. Skipping.");
  }
}