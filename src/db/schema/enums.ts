// src/db/schema/enums.ts

import { pgEnum } from "drizzle-orm/pg-core";

export const paymentStatusEnum = pgEnum("payment_status", [
  "awaiting_payment",
  "paid",
  "failed",
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "unverified",
  "pending",
  "active",
]);

export const registrationStatusEnum = pgEnum("registration_status", [
  "pending",
  "membership_approved",
  "active",
  "expired",
  "cancelled",
]);

export const scoutStatusEnum = pgEnum(
  "scout_status",
  [
    "PENDING",
    "ACTIVE",
    "SUSPENDED",
    "EXPIRED",
  ]
);

// These are the scout SECTIONS (age-based program levels/positions) --
// Kid, Kab, Boy, Senior, Rover. Previously misnamed "scout_rank"; renamed
// since these aren't advancement ranks at all. See scoutAdvancementRankEnum
// below for the actual rank/badge tiers within each section.
export const scoutSectionEnum = pgEnum(
  "scout_section",
  [
    "KID",
    "KAB",
    "BOY",
    "SENIOR",
    "ROVER",
  ]
);

// The real advancement ranks/badges a scout progresses through within
// their section (e.g. a Boy Scout progresses Tenderfoot -> Second Class ->
// First Class). Union of every section's rank ladder -- which values are
// valid for a given section is enforced in application code
// (see src/lib/utils/scout-advancement-rank.ts), not by the DB enum
// itself, since Postgres enums can't be conditionally scoped per row.
export const scoutAdvancementRankEnum = pgEnum(
  "scout_advancement_rank",
  [
    // Kab Scout
    "YOUNG_USA",
    "GROWING_USA",
    "LEAPING_USA",
    // Shared starting rank (Boy Scout & Senior Scout)
    "MEMBERSHIP",
    // Boy Scout
    "TENDERFOOT_SCOUT",
    "SECOND_CLASS_SCOUT",
    "FIRST_CLASS_SCOUT",
    "SCOUT_CITIZEN_SERVICE",
    // Senior Scout
    "EXPLORER_SCOUT",
    "PATHFINDER_SCOUT",
    "OUTDOORSMAN_SCOUT",
    "VENTURER_SCOUT",
    "EAGLE_SCOUT",
    // Rover
    "YELLOW_QUADRANT",
    "GREEN_QUADRANT",
    "RED_QUADRANT",
    "BLUE_QUADRANT",
    "CHIEF_SCOUT_NATION_BUILDER",
  ]
);

export const applicationStatusEnum = pgEnum(
  "application_status",
  [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "CANCELLED",
  ]
);

export const activityCategoryEnum = pgEnum("activity_category", [
  "COUNCIL",
  "REGIONAL",
  "NATIONAL",
]);

export const adminRoleEnum = pgEnum("admin_role", [
  "CHIEF_EXECUTIVE",
  "MEMBERSHIP_OFFICER",
  "ACTIVITIES_OFFICER",
  "FINANCE_OFFICER",
  "REGISTRAR",
  "REPORTS_OFFICER",
]);

// Which tier of the org an admin_users (officer) row belongs to.
// COUNCIL -> scoped to one council (councilId set, regionId null)
// REGIONAL -> scoped to one region (regionId set, councilId null)
// NATIONAL -> scoped to the whole org (both null)
export const adminScopeEnum = pgEnum("admin_scope", [
  "COUNCIL",
  "REGIONAL",
  "NATIONAL",
]);

export const activityRegistrationStatusEnum = pgEnum(
  "activity_registration_status",
  [
    "PENDING_REQUIREMENTS",
    "PENDING_PAYMENT",
    "PENDING_UNIT_APPROVAL",
    "PENDING_ADMIN_APPROVAL",
    "APPROVED",
    "REJECTED",
    "LEFT",
    "CANCELLED",
  ]
);