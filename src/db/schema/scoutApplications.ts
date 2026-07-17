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
import { applicationStatusEnum } from "./enums";

export const scoutApplications = pgTable("scout_applications", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),

  preferredCouncilId: uuid("preferred_council_id")
    .references(() => councils.id)
    .notNull(),

  scoutingPosition: text("scouting_position").notNull(),

  advancementRank: text("advancement_rank").notNull(),

  tenure: integer("tenure").notNull(),

  region: text("region").notNull(),

  communityBased: boolean("community_based")
    .default(false)
    .notNull(),

  sponsoringInstitution: text("sponsoring_institution"),

  requestedRegistrationYears: integer("requested_registration_years")
    .notNull(),

  // Personal & emergency-contact info — added to replace the temporary
  // JSON-in-remarks workaround. Existing approved applications created
  // before this migration still have this data only inside `remarks`;
  // getMembershipCardData() falls back to parsing that JSON when these
  // columns are empty.
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