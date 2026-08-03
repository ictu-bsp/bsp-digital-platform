// src/lib/utils/scout-advancement-rank.ts
// The real advancement ranks/badges a scout progresses through within
// their section (e.g. a Boy Scout progresses Tenderfoot -> Second Class ->
// First Class). This is what should be shown anywhere the site displays a
// scout's "rank" -- distinct from their section (see scout-section.ts).

import type { ScoutSection } from "./scout-section";

export type ScoutAdvancementRank =
  | "YOUNG_USA"
  | "GROWING_USA"
  | "LEAPING_USA"
  | "MEMBERSHIP"
  | "TENDERFOOT_SCOUT"
  | "SECOND_CLASS_SCOUT"
  | "FIRST_CLASS_SCOUT"
  | "SCOUT_CITIZEN_SERVICE"
  | "EXPLORER_SCOUT"
  | "PATHFINDER_SCOUT"
  | "OUTDOORSMAN_SCOUT"
  | "VENTURER_SCOUT"
  | "EAGLE_SCOUT"
  | "YELLOW_QUADRANT"
  | "GREEN_QUADRANT"
  | "RED_QUADRANT"
  | "BLUE_QUADRANT"
  | "CHIEF_SCOUT_NATION_BUILDER";

export const ADVANCEMENT_RANK_LABELS: Record<ScoutAdvancementRank, string> = {
  YOUNG_USA: "Young Usa (Initial rank)",
  GROWING_USA: "Growing Usa",
  LEAPING_USA: "Leaping Usa (Highest KAB rank)",
  MEMBERSHIP: "Membership",
  TENDERFOOT_SCOUT: "Tenderfoot Scout",
  SECOND_CLASS_SCOUT: "Second Class Scout",
  FIRST_CLASS_SCOUT: "First Class Scout (Highest traditional Boy Scout rank)",
  SCOUT_CITIZEN_SERVICE: "Scout Citizen / Scout Service",
  EXPLORER_SCOUT: "Explorer Scout",
  PATHFINDER_SCOUT: "Pathfinder Scout",
  OUTDOORSMAN_SCOUT: "Outdoorsman Scout (Also specialized as Airman or Seaman)",
  VENTURER_SCOUT: "Venturer Scout (Also specialized as Air Venture or Sea Venture)",
  EAGLE_SCOUT: "Eagle Scout (Highest Senior Scout rank)",
  YELLOW_QUADRANT: "Yellow Quadrant",
  GREEN_QUADRANT: "Green Quadrant",
  RED_QUADRANT: "Red Quadrant",
  BLUE_QUADRANT: "Blue Quadrant",
  CHIEF_SCOUT_NATION_BUILDER: "Chief Scout's Nation Builder (Highest Rover rank)",
};

export const KID_SCOUT_FALLBACK_RANKS: ScoutAdvancementRank[] = ["MEMBERSHIP"];

/**
 * Which advancement ranks are valid for each section, in progression
 * order (lowest first). Kid Scout has none -- no advancement ladder at
 * that section.
 */
export const ADVANCEMENT_RANKS_BY_SECTION: Record<
  ScoutSection,
  ScoutAdvancementRank[]
> = {
  KID: ["MEMBERSHIP"],
  KAB: ["YOUNG_USA", "GROWING_USA", "LEAPING_USA"],
  BOY: [
    "MEMBERSHIP",
    "TENDERFOOT_SCOUT",
    "SECOND_CLASS_SCOUT",
    "FIRST_CLASS_SCOUT",
    "SCOUT_CITIZEN_SERVICE",
  ],
  SENIOR: [
    "MEMBERSHIP",
    "EXPLORER_SCOUT",
    "PATHFINDER_SCOUT",
    "OUTDOORSMAN_SCOUT",
    "VENTURER_SCOUT",
    "EAGLE_SCOUT",
  ],
  ROVER: [
    "YELLOW_QUADRANT",
    "GREEN_QUADRANT",
    "RED_QUADRANT",
    "BLUE_QUADRANT",
    "CHIEF_SCOUT_NATION_BUILDER",
  ],
};

/** The advancement rank options (value + label) valid for a given section. */
export function getAdvancementRanksForSection(
  section: ScoutSection | null | undefined
): { value: ScoutAdvancementRank; label: string }[] {
  if (!section) return [];
  const ranks = ADVANCEMENT_RANKS_BY_SECTION[section] ?? [];
  if (!ranks.length && section === "KID") {
    return [{ value: "MEMBERSHIP", label: "Kid Scout Membership" }];
  }
  return ranks.map((value) => ({
    value,
    label:
      section === "KID" && value === "MEMBERSHIP"
        ? "Kid Scout Membership"
        : ADVANCEMENT_RANK_LABELS[value],
  }));
}
