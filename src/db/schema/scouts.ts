// src/db/schema/scouts.ts

import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { councils } from "./councils";

import {
  verificationStatusEnum,
  scoutRankEnum,
  scoutStatusEnum,
} from "./enums";

export const scouts = pgTable("scouts", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id)
    .notNull()
    .unique(),

  councilId: uuid("council_id")
    .references(() => councils.id)
    .notNull(),

  membershipNumber: text("membership_number"),

  rank: scoutRankEnum("rank")
    .default("KID")
    .notNull(),

  status: scoutStatusEnum("status")
    .default("PENDING")
    .notNull(),

  verificationStatus: verificationStatusEnum(
    "verification_status"
  )
    .default("unverified")
    .notNull(),

  approvedBy: uuid("approved_by")
    .references(() => users.id),

  approvedAt: timestamp("approved_at"),

  joinedAt: timestamp("joined_at"),

  isActive: boolean("is_active")
    .default(true)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});