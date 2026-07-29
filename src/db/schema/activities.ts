// src/db/schema/activities.ts

import { users } from "./users";
import { councils } from "./councils";
import { regions } from "./regions";
import { activityCategoryEnum, scoutRankEnum } from "./enums";
import { boolean, integer, pgTable, text, timestamp, uuid, } from "drizzle-orm/pg-core";

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Basic Information
  title: text("title").notNull(),

  description: text("description").notNull(),

  imageUrl: text("image_url"),

  // Schedule
  startDate: timestamp("start_date").notNull(),

  endDate: timestamp("end_date"),

  registrationDeadline: timestamp("registration_deadline"),

  // Location
  location: text("location").notNull(),

  // Classification

  category: activityCategoryEnum("category").notNull(),

  // Visibility scope. An activity visible to everyone (national) has both
  // of these null. A council-scoped activity sets councilId only. A
  // region-scoped activity sets regionId only (covering every council in
  // that region). These two are not expected to both be set at once.
  councilId: uuid("council_id")
    .references(() => councils.id),

  regionId: uuid("region_id")
    .references(() => regions.id),

  // Capacity
  maxParticipants: integer("max_participants"),

  // Eligibility
  // Lowest scout rank allowed to join this activity. Null/unset = open to
  // every rank. Ranks are ordered KID < KAB < BOY < SENIOR < ROVER, so a
  // scout qualifies if their rank is this rank or higher on that ladder.
  minimumRank: scoutRankEnum("minimum_rank"),

  // Fee
  // Stored in pesos as an integer (whole pesos only, no centavos) to match
  // the pattern already used for FEE_PER_YEAR in register/page.tsx.
  // Nullable + defaults handled in the app layer: null/0 = free activity.
  registrationFee: integer("registration_fee"),

  // Visibility
  isPublished: boolean("is_published")
    .default(true)
    .notNull(),

  // Audit
  createdBy: uuid("created_by").references(() => users.id),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});