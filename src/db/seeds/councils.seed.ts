//src/db/seeds/councils.seed.ts

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema";

const councilsByRegion: Record<string, string[]> = {
  "Ilocos Region Coordination Office": [
    "Dagupan City Council",
    "Eastern Pangasinan Council",
    "Ilocos Norte-Laoag City Council",
    "Ilocos Sur Council",
    "La Union Council",
    "Pangasinan-San Carlos City Council",
  ],
  "Northeastern Luzon Region Coordination Office": [
    "Abra Council",
    "Baguio City Council",
    "Batanes Council",
    "Benguet Council",
    "Cagayan North-Tuguegarao City Council",
    "Cauayan City Associate Council",
    "Ifugao Council",
    "Isabela Council",
    "Kalinga-Apayao Council",
    "Mountain Province Council",
    "Nueva Vizcaya Council",
    "Quirino Council",
    "Santiago City Council",
  ],
  "Central Luzon Region Coordination Office": [
    "Angeles City Council",
    "Aurora Council",
    "Bataan Council",
    "Bulacan Council",
    "Cabanatuan City Council",
    "James L. Gordon Council",
    "Nueva Ecija Council",
    "Pampanga Council",
    "Ramon Magsaysay (Zambales) Council",
    "Tarlac Council",
  ],
  "National Capital Region Coordination Office": [
    "City of Mandaluyong Council",
    "Kalookan City Council",
    "Las Pinas City Council",
    "Makati City Council",
    "Malabon City Council",
    "Manila Council",
    "Marikina City Council",
    "Metro Manila South-Pateros Council",
    "Muntinlupa City Associate Council",
    "Navotas City Council",
    "Paranaque City Council",
    "Pasay City Council",
    "Pasig City Council",
    "Quezon City Council",
    "San Juan City Associate Council",
    "Taguig City Council",
    "Valenzuela City Council",
  ],
  "Southern Tagalog Region Coordination Office": [
    "Antipolo City Council",
    "Batangas Council",
    "Batangas City Council",
    "Calamba City Council",
    "Cavite Council",
    "Cavite City Council",
    "City of Santa Rosa Council",
    "Laguna Council",
    "Lipa City Council",
    "Lucena City Council",
    "Marinduque Council",
    "Mindoro Occidental Council",
    "Mindoro Oriental Council",
    "Palawan-Puerto Princesa City Council",
    "Quezon Council",
    "Rizal Council",
    "Romblon Council",
    "San Pablo City Council",
  ],
  "Bicol Region Coordination Office": [
    "Camarines Norte Council",
    "Camarines Sur Council",
    "Catanduanes Council",
    "Iriga City Council",
    "Legazpi City Council",
    "Ligao City Associate Council",
    "Masbate Council",
    "Mayon Council",
    "Naga City Council",
    "Sorsogon Council",
  ],
  "Western Visayas Region Coordination Office": [
    "Aklan Council",
    "FR Antique Council",
    "Bacolod City Council",
    "Capiz Council",
    "Guimaras Council",
    "Iloilo Council",
    "Negros Occidental Council",
    "Negros Oriental-Siquijor Council",
    "Passi City Associate Council",
  ],
  "Eastern Visayas Region Coordination Office": [
    "Biliran Council",
    "Bohol Council",
    "Calbayog City Council",
    "Cebu Council",
    "Eastern Samar Council",
    "Leyte Council",
    "Northern Samar Council",
    "Ormoc City Associate Council",
    "Samar Council",
    "Southern Leyte Council",
  ],
  "Western Mindanao Region Coordination Office": [
    "Basilan Council",
    "Lanao del Sur-Marawi City Council",
    "Maguindanao-Cotabato City Council",
    "McCormick-Gepigon Sulu Council",
    "Tawi-Tawi Council",
    "Zamboanga City Council",
    "Zamboanga del Norte-Dipolog-Dapitan City Council",
    "Zamboanga del Sur-Pagadian City Council",
    "Zamboanga-Sibugay Council",
  ],
  "Eastern Mindanao Region Coordination Office": [
    "Cotabato Council",
    "Davao City Council",
    "Davao De Oro Council",
    "Davao del Norte Council",
    "Davao del Sur Council",
    "Davao Oriental Council",
    "General Santos City Council",
    "Sarangani Council",
    "South Cotabato Council",
    "Sultan Kudarat Council",
    "Tagum City Council",
  ],
  "Northeastern Mindanao Region Coordination Office": [
    "Agusan Council",
    "Agusan del Sur Council",
    "Bislig City Associate Council",
    "Bukidnon Council",
    "Cagayan de Oro City Council",
    "Camiguin Council",
    "Iligan City Council",
    "Lanao del Norte Council",
    "Misamis Occidental Council",
    "Misamis Oriental Council",
    "Siargao Council",
    "Surigao del Norte Council",
    "Surigao del Sur Council",
  ],
};

export async function seedCouncils(
  db: NodePgDatabase<typeof schema>
) {
  const regionRows = await db
    .select({ id: schema.regions.id, name: schema.regions.name })
    .from(schema.regions);

  const regionIdByName = new Map(regionRows.map((r) => [r.name, r.id]));

  const rowsToInsert: { name: string; regionId: string }[] = [];

  for (const [regionName, councilNames] of Object.entries(councilsByRegion)) {
    const regionId = regionIdByName.get(regionName);

    if (!regionId) {
      throw new Error(
        `seedCouncils: region "${regionName}" not found — did seedRegions() run before seedCouncils()?`
      );
    }

    for (const councilName of councilNames) {
      rowsToInsert.push({ name: councilName, regionId });
    }
  }

  await db.insert(schema.councils).values(rowsToInsert);

  console.log(
    `✅ Seeded ${rowsToInsert.length} councils across ${regionRows.length} regions.`
  );
}