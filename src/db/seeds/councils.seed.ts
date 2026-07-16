//src/db/seeds/councils.seed.ts

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema";

export async function seedCouncils(
  db: NodePgDatabase<typeof schema>
) {
  const councilNames = [
    "Abra Council",
    "Agusan Council",
    "Albay Council",
    "Baguio Council",
    "Batangas Council",
    "Benguet Council",
    "Bohol Council",
    "Bulacan Council",
    "Cagayan Council",
    "Camarines Norte Council",
    "Camarines Sur Council",
    "Cavite Council",
    "Cebu Council",
    "Davao Council",
    "Iloilo Council",
    "Laguna Council",
    "Leyte Council",
    "Manila Council",
    "Marikina Council",
    "Makati Council",
    "Negros Occidental Council",
    "Nueva Ecija Council",
    "Palawan Council",
    "Pampanga Council",
    "Pasig Council",
    "Quezon City Council",
    "Rizal Council",
    "Tacloban Council",
    "Taguig Council",
    "Zambales Council",
  ];

  await db.insert(schema.councils).values(
    councilNames.map((name) => ({ name }))
  );

  console.log(`✅ Seeded ${councilNames.length} councils.`);
}