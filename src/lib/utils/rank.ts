// src/lib/utils/rank.ts
//
// DEPRECATED -- kept only as a backward-compatible re-export. The real
// code now lives in scout-section.ts (sections: Kid/Kab/Boy/Senior/Rover)
// and scout-advancement-rank.ts (the actual advancement ranks/badges
// within each section). Import from those directly in new code.

export {
  type ScoutSection as ScoutRank,
  SECTION_ORDER as RANK_ORDER,
  SECTION_LABELS as RANK_LABELS,
  meetsSectionRequirement as meetsRankRequirement,
  SCOUT_SECTION_AGE_BRACKETS as SCOUT_POSITION_AGE_BRACKETS,
  getEligibleScoutSections as getEligibleScoutPositions,
} from "./scout-section";
