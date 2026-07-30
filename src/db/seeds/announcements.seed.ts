// src/db/seeds/announcements.seed.ts

import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../schema";
import { announcements } from "../schema/announcements";

export async function seedAnnouncements(
  db: NodePgDatabase<typeof schema>
) {
  const superAdmin = await db.query.users.findFirst({
    where: eq(schema.users.email, "admin@bsp.ph"),
  });

  const andrei = await db.query.users.findFirst({
    where: eq(schema.users.email, "art.testadmin@bsp.ph"),
  });

  const regionalAdmin = await db.query.users.findFirst({
    where: eq(schema.users.email, "centralluzon.regionaladmin@bsp.ph"),
  });

  if (!superAdmin || !andrei || !regionalAdmin || !andrei.councilId || !regionalAdmin.regionId) {
    throw new Error(
      "Expected admin accounts not found while seeding announcements. Seed users first."
    );
  }

  await db.insert(announcements).values([
    {
      title: "BSP National Scouting Week",
      content: "Join Scouts nationwide in celebrating National Scouting Week this coming month, with activities in every region.",
      visibility: "PUBLIC",
      isPinned: true,
      authorId: superAdmin.id,
    },
    {
      title: "New Advancement Requirements",
      content: "Updated advancement requirements for all ranks are now available. Verified scouts should review the changes with their unit leaders.",
      visibility: "SCOUTS",
      authorId: superAdmin.id,
    },
    {
      title: "Manila Council Office Hours",
      content: "The Manila Council office will have updated hours starting next week. Please check with your unit leader for details.",
      visibility: "COUNCIL",
      councilId: andrei.councilId,
      authorId: andrei.id,
    },
    {
      title: "Central Luzon Leader Training",
      content: "A regional leader training course is scheduled for all Central Luzon councils. Slots are limited, register early.",
      visibility: "REGIONAL",
      regionId: regionalAdmin.regionId,
      authorId: regionalAdmin.id,
    },
  ]);

  console.log("✅ Seeded 4 announcements across PUBLIC, SCOUTS, COUNCIL, and REGIONAL visibility.");
}
