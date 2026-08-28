// src/db/schema/scouts.ts

import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

import { users } from "./users";
import { councils } from "./councils";

import {
  verificationStatusEnum,
  scoutSectionEnum,
  scoutAdvancementRankEnum,
  scoutStatusEnum,
} from "./enums";

export const scouts = pgTable("scouts", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id)
    .notNull()
    .unique(),

  councilId: uuid("council_id")
    .references(() => councils.id)
    .notNull(),

  membershipNumber: text("membership_number"),

  // Which scout section this scout belongs to (Kid/Kab/Boy/Senior/Rover).
  // Previously named "rank" -- renamed since it's actually the section.
  section: scoutSectionEnum("section").default("KID").notNull(),

  // The scout's current advancement rank/badge within their section (e.g.
  // "TENDERFOOT_SCOUT" for a Boy Scout). Null until they've earned one.
  advancementRank: scoutAdvancementRankEnum("advancement_rank"),

  status: scoutStatusEnum("status").default("PENDING").notNull(),

  verificationStatus: verificationStatusEnum("verification_status")
    .default("unverified")
    .notNull(),

  approvedBy: uuid("approved_by").references(() => users.id),

  approvedAt: timestamp("approved_at"),

  joinedAt: timestamp("joined_at"),

  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
