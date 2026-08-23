// src/db/seeds/notifications.seed.ts
import { eq, and, isNotNull } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

import * as schema from "../schema";
import { notifications } from "../schema/notifications";

export async function seedNotifications(
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
      "Expected admin accounts not found while seeding notifications. Seed users first."
    );
  }

  await db.insert(notifications).values([
    {
      title: "Welcome to eScout",
      message: "Track your Scouting journey, join activities, and stay updated -- all in one place.",
      visibility: "PUBLIC",
      authorId: superAdmin.id,
    }
  ]);

  console.log("✅ Seeded notification for public - default welcome message");
}