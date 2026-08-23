// src/db/seeds/announcements.seed.ts
import { eq, and, isNotNull } from "drizzle-orm";
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
    where: and(
      eq(schema.users.role, "REGIONAL_ADMIN"),
      isNotNull(schema.users.regionId)
    ),
  });

  if (!superAdmin || !andrei || !regionalAdmin || !andrei.councilId || !regionalAdmin.regionId) {
    throw new Error(
      "Expected admin accounts not found while seeding announcements. Seed users first."
    );
  }

  await db.insert(announcements).values([
    {
      title: "One Mindanao Jamboree is Coming!",
      content: "Get ready for an epic gathering of fellowship, skill-building, and the 40-badge National Merit Badge Challenge. Stay tuned for official schedules and registration updates!",
      visibility: "PUBLIC",
      authorId: superAdmin.id,
    },
    {
      title: "BSP National Scouting Week",
      content: "Join Scouts nationwide in celebrating National Scouting Week this coming month, with activities in every region.",
      visibility: "PUBLIC",
      isPinned: true,
      authorId: superAdmin.id,
    }
    
  ]);

  console.log("✅ Seeded 2 announcements across PUBLIC visibility.");
}