import { db } from "@/db";
import { advancements } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export interface AdvancementProgressState {
  [rankKey: string]: Array<{
    id: string;
    name: string;
    isCompleted?: boolean;
    note?: string;
    description?: string;
    notes?: string;
    uploadedFileName?: string | null;
    uploadedUrl?: string | null;
    approvalStatus?: "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
  }>;
}

function parseRemarks(value: string | null | undefined): AdvancementProgressState | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as AdvancementProgressState;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export async function getScoutAdvancementProgress(scoutId: string) {
  const [row] = await db
    .select({
      remarks: advancements.remarks,
    })
    .from(advancements)
    .where(eq(advancements.scoutId, scoutId))
    .orderBy(desc(advancements.updatedAt))
    .limit(1);

  return parseRemarks(row?.remarks) ?? {};
}

export async function saveScoutAdvancementProgress(
  scoutId: string,
  progressState: AdvancementProgressState,
  defaultRank: string = "MEMBERSHIP"
) {
  const remarks = JSON.stringify(progressState);

  const existing = await db
    .select({ id: advancements.id })
    .from(advancements)
    .where(eq(advancements.scoutId, scoutId))
    .orderBy(desc(advancements.updatedAt))
    .limit(1);

  const [current] = existing;

  if (current?.id) {
    await db
      .update(advancements)
      .set({
        remarks,
        status: "in_progress",
        updatedAt: new Date(),
      })
      .where(eq(advancements.id, current.id));
  } else {
    await db.insert(advancements).values({
      scoutId,
      rank: defaultRank as typeof advancements.$inferInsert.rank,
      status: "in_progress",
      remarks,
    });
  }

  return progressState;
}
