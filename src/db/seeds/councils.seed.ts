// src/db/seeds/councils.seed.ts

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema";

interface CouncilSeedEntry {
  councilNumber: string;
  name: string;
  regionName: string;
}

const councilsData: CouncilSeedEntry[] = [
  // Ilocos Region (IR)
  { councilNumber: "002", name: "Dagupan City", regionName: "Ilocos Region" },
  { councilNumber: "003", name: "Eastern Pangasinan", regionName: "Ilocos Region" },
  { councilNumber: "004", name: "Ilocos Norte-Laoag City", regionName: "Ilocos Region" },
  { councilNumber: "005", name: "Ilocos Sur", regionName: "Ilocos Region" },
  { councilNumber: "006", name: "La Union", regionName: "Ilocos Region" },
  { councilNumber: "007", name: "Pangasinan - San Carlos City", regionName: "Ilocos Region" },

  // Northeastern Luzon Region (NELR)
  { councilNumber: "008", name: "Abra", regionName: "Northeastern Luzon Region" },
  { councilNumber: "009", name: "Baguio City", regionName: "Northeastern Luzon Region" },
  { councilNumber: "010", name: "Batanes", regionName: "Northeastern Luzon Region" },
  { councilNumber: "011", name: "Benguet", regionName: "Northeastern Luzon Region" },
  { councilNumber: "012", name: "Cagayan North-Tug. City", regionName: "Northeastern Luzon Region" },
  { councilNumber: "013", name: "Cauayan City Associate", regionName: "Northeastern Luzon Region" },
  { councilNumber: "014", name: "Ifugao", regionName: "Northeastern Luzon Region" },
  { councilNumber: "015", name: "Isabela", regionName: "Northeastern Luzon Region" },
  { councilNumber: "016", name: "Kalinga-Apayao", regionName: "Northeastern Luzon Region" },
  { councilNumber: "017", name: "Mt. Province", regionName: "Northeastern Luzon Region" },
  { councilNumber: "018", name: "Nueva Vizcaya", regionName: "Northeastern Luzon Region" },
  { councilNumber: "019", name: "Quirino", regionName: "Northeastern Luzon Region" },
  { councilNumber: "020", name: "Santiago City", regionName: "Northeastern Luzon Region" },

  // Central Luzon Region (CLR)
  { councilNumber: "021", name: "Angeles City", regionName: "Central Luzon Region" },
  { councilNumber: "022", name: "Aurora", regionName: "Central Luzon Region" },
  { councilNumber: "023", name: "Bataan", regionName: "Central Luzon Region" },
  { councilNumber: "024", name: "Bulacan", regionName: "Central Luzon Region" },
  { councilNumber: "025", name: "Cabanatuan City", regionName: "Central Luzon Region" },
  { councilNumber: "026", name: "James L. Gordon", regionName: "Central Luzon Region" },
  { councilNumber: "027", name: "Nueva Ecija", regionName: "Central Luzon Region" },
  { councilNumber: "028", name: "Pampanga", regionName: "Central Luzon Region" },
  { councilNumber: "029", name: "Ramon Magsaysay-Zambales", regionName: "Central Luzon Region" },
  { councilNumber: "030", name: "Tarlac", regionName: "Central Luzon Region" },

  // National Capital Region (NCR)
  { councilNumber: "031", name: "City of Mandaluyong", regionName: "National Capital Region" },
  { councilNumber: "032", name: "Kalookan City", regionName: "National Capital Region" },
  { councilNumber: "033", name: "Las Pinas City", regionName: "National Capital Region" },
  { councilNumber: "034", name: "Makati City", regionName: "National Capital Region" },
  { councilNumber: "035", name: "Malabon City", regionName: "National Capital Region" },
  { councilNumber: "036", name: "Manila", regionName: "National Capital Region" },
  { councilNumber: "037", name: "Marikina City", regionName: "National Capital Region" },
  { councilNumber: "038", name: "Metro Manila South-Pateros", regionName: "National Capital Region" },
  { councilNumber: "039", name: "Muntinlupa City", regionName: "National Capital Region" },
  { councilNumber: "040", name: "Navotas City", regionName: "National Capital Region" },
  { councilNumber: "041", name: "Parañaque City", regionName: "National Capital Region" },
  { councilNumber: "042", name: "Pasay City", regionName: "National Capital Region" },
  { councilNumber: "043", name: "Pasig City", regionName: "National Capital Region" },
  { councilNumber: "044", name: "Quezon City", regionName: "National Capital Region" },
  { councilNumber: "045", name: "San Juan City Associate", regionName: "National Capital Region" },
  { councilNumber: "046", name: "Taguig City", regionName: "National Capital Region" },
  { councilNumber: "047", name: "Valenzuela City", regionName: "National Capital Region" },

  // Southern Tagalog Region (STR)
  { councilNumber: "048", name: "Antipolo City", regionName: "Southern Tagalog Region" },
  { councilNumber: "049", name: "Batangas", regionName: "Southern Tagalog Region" },
  { councilNumber: "050", name: "Batangas City", regionName: "Southern Tagalog Region" },
  { councilNumber: "051", name: "Calaca City Associate", regionName: "Southern Tagalog Region" },
  { councilNumber: "052", name: "Calamba City", regionName: "Southern Tagalog Region" },
  { councilNumber: "053", name: "Cavite", regionName: "Southern Tagalog Region" },
  { councilNumber: "054", name: "Cavite City", regionName: "Southern Tagalog Region" },
  { councilNumber: "055", name: "City of Santa Rosa", regionName: "Southern Tagalog Region" },
  { councilNumber: "056", name: "Laguna", regionName: "Southern Tagalog Region" },
  { councilNumber: "057", name: "Lipa City", regionName: "Southern Tagalog Region" },
  { councilNumber: "058", name: "Lucena City", regionName: "Southern Tagalog Region" },
  { councilNumber: "059", name: "Marinduque", regionName: "Southern Tagalog Region" },
  { councilNumber: "060", name: "Mindoro Occidental", regionName: "Southern Tagalog Region" },
  { councilNumber: "061", name: "Mindoro Oriental", regionName: "Southern Tagalog Region" },
  { councilNumber: "062", name: "Palawan-Puerto Princesa City", regionName: "Southern Tagalog Region" },
  { councilNumber: "063", name: "Quezon", regionName: "Southern Tagalog Region" },
  { councilNumber: "064", name: "Rizal", regionName: "Southern Tagalog Region" },
  { councilNumber: "065", name: "Romblon", regionName: "Southern Tagalog Region" },
  { councilNumber: "066", name: "San Pablo City", regionName: "Southern Tagalog Region" },

  // Bicol Region (BR)
  { councilNumber: "067", name: "Camarines Norte", regionName: "Bicol Region" },
  { councilNumber: "068", name: "Camarines Sur", regionName: "Bicol Region" },
  { councilNumber: "069", name: "Catanduanes", regionName: "Bicol Region" },
  { councilNumber: "070", name: "Iriga City", regionName: "Bicol Region" },
  { councilNumber: "071", name: "Legazpi City", regionName: "Bicol Region" },
  { councilNumber: "072", name: "Ligao City Associate", regionName: "Bicol Region" },
  { councilNumber: "073", name: "Masbate", regionName: "Bicol Region" },
  { councilNumber: "074", name: "Mayon (Albay)", regionName: "Bicol Region" },
  { councilNumber: "075", name: "Naga City", regionName: "Bicol Region" },
  { councilNumber: "076", name: "Sorsogon", regionName: "Bicol Region" },

  // Western Visayas Region (WVR)
  { councilNumber: "077", name: "Aklan", regionName: "Western Visayas Region" },
  { councilNumber: "078", name: "Antique", regionName: "Western Visayas Region" },
  { councilNumber: "079", name: "Bacolod City", regionName: "Western Visayas Region" },
  { councilNumber: "080", name: "Capiz", regionName: "Western Visayas Region" },
  { councilNumber: "081", name: "Guimaras", regionName: "Western Visayas Region" },
  { councilNumber: "082", name: "Iloilo (Confesor)", regionName: "Western Visayas Region" },
  { councilNumber: "083", name: "Negros Occidental", regionName: "Western Visayas Region" },
  { councilNumber: "084", name: "Negros Oriental-Siquijor", regionName: "Western Visayas Region" },
  { councilNumber: "085", name: "Passi City Associate", regionName: "Western Visayas Region" },

  // Eastern Visayas Region (EVR)
  { councilNumber: "086", name: "Biliran", regionName: "Eastern Visayas Region" },
  { councilNumber: "087", name: "Bohol", regionName: "Eastern Visayas Region" },
  { councilNumber: "088", name: "Calbayog City", regionName: "Eastern Visayas Region" },
  { councilNumber: "089", name: "Cebu", regionName: "Eastern Visayas Region" },
  { councilNumber: "090", name: "Eastern Samar", regionName: "Eastern Visayas Region" },
  { councilNumber: "091", name: "Leyte", regionName: "Eastern Visayas Region" },
  { councilNumber: "092", name: "Northern Samar", regionName: "Eastern Visayas Region" },
  { councilNumber: "093", name: "Ormoc City", regionName: "Eastern Visayas Region" },
  { councilNumber: "094", name: "Samar", regionName: "Eastern Visayas Region" },
  { councilNumber: "095", name: "Southern Leyte", regionName: "Eastern Visayas Region" },
  { councilNumber: "096", name: "Tacloban City", regionName: "Eastern Visayas Region" },

  // Western Mindanao Region (WMR)
  { councilNumber: "097", name: "Basilan", regionName: "Western Mindanao Region" },
  { councilNumber: "098", name: "Lanao del Sur-Marawi City", regionName: "Western Mindanao Region" },
  { councilNumber: "099", name: "Maguindanao- Cotabato City", regionName: "Western Mindanao Region" },
  { councilNumber: "100", name: "M-G Sulu", regionName: "Western Mindanao Region" },
  { councilNumber: "101", name: "Tawi-Tawi", regionName: "Western Mindanao Region" },
  { councilNumber: "102", name: "Zamboanga City", regionName: "Western Mindanao Region" },
  { councilNumber: "103", name: "ZanDiDap", regionName: "Western Mindanao Region" },
  { councilNumber: "104", name: "Zam. del Sur-Pagadian City", regionName: "Western Mindanao Region" },
  { councilNumber: "105", name: "Zamboanga-Sibugay", regionName: "Western Mindanao Region" },

  // Eastern Mindanao Region (EMR)
  { councilNumber: "106", name: "Cotabato", regionName: "Eastern Mindanao Region" },
  { councilNumber: "107", name: "Davao City", regionName: "Eastern Mindanao Region" },
  { councilNumber: "108", name: "Davao de Oro", regionName: "Eastern Mindanao Region" },
  { councilNumber: "109", name: "Davao del Norte", regionName: "Eastern Mindanao Region" },
  { councilNumber: "110", name: "Davao del Sur", regionName: "Eastern Mindanao Region" },
  { councilNumber: "111", name: "Davao Oriental", regionName: "Eastern Mindanao Region" },
  { councilNumber: "112", name: "General Santos City", regionName: "Eastern Mindanao Region" },
  { councilNumber: "113", name: "Sarangani", regionName: "Eastern Mindanao Region" },
  { councilNumber: "114", name: "South Cotabato", regionName: "Eastern Mindanao Region" },
  { councilNumber: "115", name: "Sultan Kudarat", regionName: "Eastern Mindanao Region" },
  { councilNumber: "116", name: "Tagum City", regionName: "Eastern Mindanao Region" },

  // Northeastern Mindanao Region (NEMR)
  { councilNumber: "117", name: "Agusan", regionName: "Northeastern Mindanao Region" },
  { councilNumber: "118", name: "Agusan del Sur", regionName: "Northeastern Mindanao Region" },
  { councilNumber: "119", name: "Bislig City Associate", regionName: "Northeastern Mindanao Region" },
  { councilNumber: "120", name: "Bukidnon", regionName: "Northeastern Mindanao Region" },
  { councilNumber: "121", name: "Cagayan de Oro City", regionName: "Northeastern Mindanao Region" },
  { councilNumber: "122", name: "Camiguin", regionName: "Northeastern Mindanao Region" },
  { councilNumber: "123", name: "Iligan City", regionName: "Northeastern Mindanao Region" },
  { councilNumber: "124", name: "Lanao del Norte", regionName: "Northeastern Mindanao Region" },
  { councilNumber: "125", name: "Misamis Occidental", regionName: "Northeastern Mindanao Region" },
  { councilNumber: "126", name: "Misamis Oriental", regionName: "Northeastern Mindanao Region" },
  { councilNumber: "127", name: "Siargao", regionName: "Northeastern Mindanao Region" },
  { councilNumber: "128", name: "Surigao del Norte", regionName: "Northeastern Mindanao Region" },
  { councilNumber: "129", name: "Surigao del Sur", regionName: "Northeastern Mindanao Region" },
];

export async function seedCouncils(db: NodePgDatabase<typeof schema>) {
  const regionRows = await db
    .select({ id: schema.regions.id, name: schema.regions.name })
    .from(schema.regions);

  const regionIdByName = new Map(regionRows.map((r) => [r.name, r.id]));

  const rowsToInsert = councilsData.map((council) => {
    const regionId = regionIdByName.get(council.regionName);

    if (!regionId) {
      throw new Error(
        `seedCouncils: region "${council.regionName}" not found — did seedRegions() run before seedCouncils()?`
      );
    }

    return {
      name: council.name,
      regionId,
      councilNumber: council.councilNumber,
    };
  });

  await db.insert(schema.councils).values(rowsToInsert);

  console.log(
    `✅ Seeded ${rowsToInsert.length} councils with code numbers 002 to 129 across ${regionRows.length} regions.`
  );
}