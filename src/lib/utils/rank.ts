// src/lib/utils/rank.ts
//Represents the fundamental rank classifications in scouting.
export type ScoutRank = "KID" | "KAB" | "BOY" | "SENIOR" | "ROVER";
/**
 * Array ordering ranks from lowest ("KID") to highest ("ROVER").
 * Mirrors the `scout_rank` enum defined in `src/db/schema/enums.ts`.
 * @note Maintain exact order parity if the DB enum schema ever changes.
 */
export const RANK_ORDER: ScoutRank[] = [
  "KID",
  "KAB",
  "BOY",
  "SENIOR",
  "ROVER",
];
/**
 * Human-readable string labels corresponding to each ScoutRank key.
 */
export const RANK_LABELS: Record<ScoutRank, string> = {
  KID: "Kid Scout",
  KAB: "Kab Scout",
  BOY: "Boy Scout",
  SENIOR: "Senior Scout",
  ROVER: "Rover Scout",
};
/**
 * Evaluates whether a scout meets or exceeds a minimum rank requirement.
 * @param scoutRank - The current rank assigned to the scout.
 * @param minimumRank - The required minimum rank threshold, or `null`/`undefined` if open to all ranks.
 * @returns `true` if the scout's rank position is equal to or higher than `minimumRank`, otherwise `false`.
 */
export function meetsRankRequirement(
  scoutRank: ScoutRank,
  minimumRank: ScoutRank | null | undefined
): boolean {
  if (!minimumRank) return true;
  return RANK_ORDER.indexOf(scoutRank) >= RANK_ORDER.indexOf(minimumRank);
}