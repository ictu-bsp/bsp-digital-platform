// src/lib/utils/rank.ts

export type ScoutRank = "KID" | "KAB" | "BOY" | "SENIOR" | "ROVER";

// Ordered lowest to highest. Mirrors the scout_rank enum in
// src/db/schema/enums.ts — keep these in sync if that enum ever changes.
export const RANK_ORDER: ScoutRank[] = [
  "KID",
  "KAB",
  "BOY",
  "SENIOR",
  "ROVER",
];

export const RANK_LABELS: Record<ScoutRank, string> = {
  KID: "Kid Scout",
  KAB: "Kab Scout",
  BOY: "Boy Scout",
  SENIOR: "Senior Scout",
  ROVER: "Rover Scout",
};

/**
 * True if `scoutRank` is at or above `minimumRank` on the rank ladder.
 * A `minimumRank` of null/undefined means there's no requirement — everyone
 * qualifies.
 */
export function meetsRankRequirement(
  scoutRank: ScoutRank,
  minimumRank: ScoutRank | null | undefined
): boolean {
  if (!minimumRank) return true;
  return RANK_ORDER.indexOf(scoutRank) >= RANK_ORDER.indexOf(minimumRank);
}
