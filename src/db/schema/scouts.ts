// src/db/schema/scouts.ts

import {
  pgTable,
  text,
  uuid,
  timestamp,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { verificationStatusEnum } from "./enums";
import { councils } from "./councils";

export const scouts = pgTable("scouts", {
  id: uuid("id").defaultRandom().primaryKey(),

  councilId: uuid("council_id")
    .references(() => councils.id)
    .notNull(),

  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),

  scoutIdNumber: text("scout_id_number"),

  verificationStatus: verificationStatusEnum("verification_status")
    .default("unverified")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});