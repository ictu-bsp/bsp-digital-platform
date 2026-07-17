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

  await db.insert(schema.scouts).values({
    userId: marc.id,

    councilId: council.id,

    membershipNumber: "BSP-2026-000001",

    rank: "KID",

    status: "ACTIVE",

    verificationStatus: "active",

    joinedAt: new Date(),

    approvedBy: null,

    approvedAt: new Date(),

    isActive: true,
  });

  console.log("✅ Seeded scout profile.");
}