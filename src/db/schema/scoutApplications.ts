// src/db/schema/scoutApplications.ts

import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { councils } from "./councils";
import { applicationStatusEnum, scoutSectionEnum, scoutAdvancementRankEnum } from "./enums";

export const scoutApplications = pgTable("scout_applications", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),

  preferredCouncilId: uuid("preferred_council_id")
    .references(() => councils.id),

  scoutingPosition: text("scouting_position"),

  // Scout section and advancement rank selected by the applicant.
  scoutSection: scoutSectionEnum("scout_section"), // KID | KAB | BOY | SENIOR | ROVER
  advancementRank: scoutAdvancementRankEnum("advancement_rank"), // e.g. TENDERFOOT_SCOUT

  tenure: integer("tenure").default(0),

  region: text("region"),

  communityBased: boolean("community_based")
    .default(false)
    .notNull(),

  sponsoringInstitution: text("sponsoring_institution"), // Nullable,

  requestedRegistrationYears: integer("requested_registration_years")
    .default(1)
    .notNull(),

  // Personal & emergency-contact info
  bloodType: text("blood_type"),
  address: text("address"),
  telephoneNumber: text("telephone_number"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactRelationship: text("emergency_contact_relationship"),
  emergencyContactNumber: text("emergency_contact_number"),

  remarks: text("remarks"),

  status: applicationStatusEnum("status")
    .default("PENDING")
    .notNull(),

  reviewedBy: uuid("reviewed_by")
    .references(() => users.id),

  reviewedAt: timestamp("reviewed_at"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});