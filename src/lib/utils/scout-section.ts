// src/lib/utils/scout-section.ts
// Represents the scout SECTIONS (age-based program levels) -- Kid, Kab,
// Boy, Senior, Rover. Previously (incorrectly) called "rank" throughout
// the codebase; renamed since these aren't advancement ranks at all. See
// scout-advancement-rank.ts for the actual rank/badge tiers within each
// section.

export type ScoutSection = "KID" | "KAB" | "BOY" | "SENIOR" | "ROVER";

/**
 * Array ordering sections from lowest ("KID") to highest ("ROVER").
 * Mirrors the `scout_section` enum defined in `src/db/schema/enums.ts`.
 * @note Maintain exact order parity if the DB enum schema ever changes.
 */
export const SECTION_ORDER: ScoutSection[] = [
  "KID",
  "KAB",
  "BOY",
  "SENIOR",
  "ROVER",
];

/**
 * Human-readable string labels corresponding to each ScoutSection key.
 */
export const SECTION_LABELS: Record<ScoutSection, string> = {
  KID: "Kid Scout",
  KAB: "Kab Scout",
  BOY: "Boy Scout",
  SENIOR: "Senior Scout",
  ROVER: "Rover Scout",
};

/**
 * Evaluates whether a scout meets or exceeds a minimum section requirement.
 * @param scoutSection - The current section assigned to the scout.
 * @param minimumSection - The required minimum section threshold, or `null`/`undefined` if open to all sections.
 * @returns `true` if the scout's section position is equal to or higher than `minimumSection`, otherwise `false`.
 */
export function meetsSectionRequirement(
  scoutSection: ScoutSection,
  minimumSection: ScoutSection | null | undefined
): boolean {
  if (!minimumSection) return true;
  return SECTION_ORDER.indexOf(scoutSection) >= SECTION_ORDER.indexOf(minimumSection);
}

/**
 * BSP age realignment brackets for the "Scouting Position" question asked
 * during membership application. `value` here matches the ScoutSection
 * enum values directly (e.g. "KID"), not the old lowercase form ("kid_scout").
 *
 * Brackets are [minAge, maxAge) -- min inclusive, max exclusive -- except
 * the last (Rover), which is inclusive of maxAge since there's no bracket
 * above it.
 */
export const SCOUT_SECTION_AGE_BRACKETS = [
  { value: "KID", label: "Kid Scout", minAge: 5, maxAge: 6 },
  { value: "KAB", label: "Kab Scout", minAge: 6, maxAge: 9 },
  { value: "BOY", label: "Boy Scout", minAge: 9, maxAge: 12 },
  { value: "SENIOR", label: "Senior Scout", minAge: 12, maxAge: 18 },
  { value: "ROVER", label: "Rover", minAge: 18, maxAge: 26 },
] as const satisfies readonly { value: ScoutSection; label: string; minAge: number; maxAge: number }[];

/** Which Scout Section option(s) are appropriate for a given age. */
export function getEligibleScoutSections(age: number) {
  return SCOUT_SECTION_AGE_BRACKETS.filter((bracket, index) => {
    const isLast = index === SCOUT_SECTION_AGE_BRACKETS.length - 1;
    return (
      age >= bracket.minAge &&
      (isLast ? age <= bracket.maxAge : age < bracket.maxAge)
    );
  });
}

/**
 * Best-effort mapping from loosely-formatted section input (old lowercase
 * form values like "kid_scout", raw enum values, mixed case, etc.) to a
 * proper ScoutSection enum value. Returns null if nothing matches.
 */
export function resolveScoutSection(
  raw: string | null | undefined
): ScoutSection | null {
  if (!raw) return null;
  const upper = raw.toUpperCase();
  for (const section of SECTION_ORDER) {
    if (upper.includes(section)) return section;
  }
  return null;
}
