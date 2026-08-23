// src/db/seeds/regions.seed.ts

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema";

export async function seedRegions(
  db: NodePgDatabase<typeof schema>
) {
  // Mapping of exact region names to their 2-digit numbers
  const regionsData = [
    { name: "Ilocos Region", regionNumber: "01" },
    { name: "Northeastern Luzon Region", regionNumber: "02" },
    { name: "Central Luzon Region", regionNumber: "03" },
    { name: "National Capital Region", regionNumber: "04" },
    { name: "Southern Tagalog Region", regionNumber: "05" },
    { name: "Bicol Region", regionNumber: "06" },
    { name: "Western Visayas Region", regionNumber: "07" },
    { name: "Eastern Visayas Region", regionNumber: "08" },
    { name: "Western Mindanao Region", regionNumber: "09" },
    { name: "Eastern Mindanao Region", regionNumber: "10" },
    { name: "Northeastern Mindanao Region", regionNumber: "11" },
    { name: "National Office", regionNumber: "12" },
  ];

  await db.insert(schema.regions).values(regionsData);

  console.log(`✅ Seeded ${regionsData.length} regions with code numbers.`);
}