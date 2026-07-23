// src/db/seeds/regions.seed.ts

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema";

export async function seedRegions(
  db: NodePgDatabase<typeof schema>
) {
  // Mapping of exact region names to their 2-digit numbers
  const regionsData = [
    { name: "Ilocos Region Coordination Office", regionNumber: "01" },
    { name: "Northeastern Luzon Region Coordination Office", regionNumber: "02" },
    { name: "Central Luzon Region Coordination Office", regionNumber: "03" },
    { name: "National Capital Region Coordination Office", regionNumber: "04" },
    { name: "Southern Tagalog Region Coordination Office", regionNumber: "05" },
    { name: "Bicol Region Coordination Office", regionNumber: "06" },
    { name: "Western Visayas Region Coordination Office", regionNumber: "07" },
    { name: "Eastern Visayas Region Coordination Office", regionNumber: "08" },
    { name: "Western Mindanao Region Coordination Office", regionNumber: "09" },
    { name: "Eastern Mindanao Region Coordination Office", regionNumber: "10" },
    { name: "Northeastern Mindanao Region Coordination Office", regionNumber: "11" },
    { name: "National Office", regionNumber: "12" },
  ];

  await db.insert(schema.regions).values(regionsData);

  console.log(`✅ Seeded ${regionsData.length} regions with code numbers.`);
}