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

/**
 * BSP age realignment brackets for the "Scouting Position" question asked
 * during membership application. Uses the same lowercase value strings the
 * application form's dropdown already stores (e.g. "kid_scout"), which is
 * a different convention from the `ScoutRank`/`scout_rank` enum above
 * (e.g. "KID") used once someone is an actual verified scout.
 *
 * Brackets are [minAge, maxAge) -- min inclusive, max exclusive -- except
 * the last (Rover), which is inclusive of maxAge since there's no bracket
 * above it.
 */
export const SCOUT_POSITION_AGE_BRACKETS = [
  { value: "kid_scout", label: "Kid Scout", minAge: 5, maxAge: 6 },
  { value: "kab_scout", label: "Kab Scout", minAge: 6, maxAge: 9 },
  { value: "boy_scout", label: "Boy Scout", minAge: 9, maxAge: 12 },
  { value: "senior_scout", label: "Senior Scout", minAge: 12, maxAge: 18 },
  { value: "rover", label: "Rover", minAge: 18, maxAge: 26 },
] as const;

/** Which Scouting Position option(s) are appropriate for a given age. */
export function getEligibleScoutPositions(age: number) {
  return SCOUT_POSITION_AGE_BRACKETS.filter((bracket, index) => {
    const isLast = index === SCOUT_POSITION_AGE_BRACKETS.length - 1;
    return (
      age >= bracket.minAge &&
      (isLast ? age <= bracket.maxAge : age < bracket.maxAge)
    );
  });
}