// src/services/scout.service.ts

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { scouts } from "@/db/schema";

export async function getScoutByUserId(userId: string) {
  const [scout] = await db
    .select()
    .from(scouts)
    .where(eq(scouts.userId, userId));

  return scout ?? null;
}


export async function createScout(input: { userId: string; councilId: string }) {
  const [scout] = await db
    .insert(scouts)
    .values({
      userId: input.userId,
      councilId: input.councilId,
    })
    .returning();

  return scout;
}