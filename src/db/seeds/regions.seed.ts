//src/db/seeds/regions.seed.ts

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema";

export async function seedRegions(
  db: NodePgDatabase<typeof schema>
) {
  const regionNames = [
    "Ilocos Region Coordination Office",
    "Northeastern Luzon Region Coordination Office",
    "Central Luzon Region Coordination Office",
    "National Capital Region Coordination Office",
    "Southern Tagalog Region Coordination Office",
    "Bicol Region Coordination Office",
    "Western Visayas Region Coordination Office",
    "Eastern Visayas Region Coordination Office",
    "Western Mindanao Region Coordination Office",
    "Eastern Mindanao Region Coordination Office",
    "Northeastern Mindanao Region Coordination Office",
    "National Office",
  ];

  await db.insert(schema.regions).values(
    regionNames.map((name) => ({ name }))
  );

  console.log(`✅ Seeded ${regionNames.length} regions.`);
}