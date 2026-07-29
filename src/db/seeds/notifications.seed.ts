// src/db/seeds/notifications.seed.ts

import { eq } from "drizzle-orm";
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
    where: eq(schema.users.email, "centralluzon.regionaladmin@bsp.ph"),
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
    },
    {
      title: "Advancement Tracking Now Live",
      message: "Verified scouts can now track their rank advancement directly from the dashboard.",
      visibility: "SCOUTS",
      authorId: superAdmin.id,
    },
    {
      title: "Manila Council Investiture Ceremony",
      message: "Join us this weekend for the quarterly investiture ceremony at the Manila Council office.",
      visibility: "COUNCIL",
      councilId: andrei.councilId,
      authorId: andrei.id,
    },
    {
      title: "Central Luzon Regional Camporee",
      message: "Registration for the regional camporee is now open for all Central Luzon councils.",
      visibility: "REGIONAL",
      regionId: regionalAdmin.regionId,
      link: "/scout/activities",
      authorId: regionalAdmin.id,
    },
  ]);

  console.log("✅ Seeded 4 notifications across PUBLIC, SCOUTS, COUNCIL, and REGIONAL visibility.");
}
