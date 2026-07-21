// src/services/council.service.ts

import { db } from "@/db";
import { councils, regions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getAllCouncils() {
  const allCouncils = await db
    .select({
      id: councils.id,
      name: councils.name,
      regionId: councils.regionId,
    })
    .from(councils)
    .orderBy(councils.name);

  return allCouncils;
}

export async function getAllRegions() {
  const allRegions = await db
    .select({
      id: regions.id,
      name: regions.name,
    })
    .from(regions)
    .orderBy(regions.name);

  return allRegions;
}

export async function getCouncilRegion(councilId: string) {
  const [result] = await db
    .select({
      regionId: councils.regionId,
      regionName: regions.name,
    })
    .from(councils)
    .leftJoin(regions, eq(councils.regionId, regions.id))
    .where(eq(councils.id, councilId));

  return result ?? null;
}