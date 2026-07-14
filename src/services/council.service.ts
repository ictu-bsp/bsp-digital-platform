// src/services/council.service.ts

import { db } from "@/db";
import { councils } from "@/db/schema";

export async function getAllCouncils() {
  const allCouncils = await db
    .select({
      id: councils.id,
      name: councils.name,
    })
    .from(councils)
    .orderBy(councils.name);

  return allCouncils;
}