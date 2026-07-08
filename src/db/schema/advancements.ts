// src/db/schema/advancements.ts

import {
  pgTable,
  uuid,
  timestamp,
  text,
} from "drizzle-orm/pg-core";

import { scouts } from "./scouts";

export const advancements = pgTable("advancements", {
  id: uuid("id").defaultRandom().primaryKey(),

  scoutId: uuid("scout_id")
    .references(() => scouts.id)
    .notNull(),

  rank: text("rank").notNull(),

  status: text("status")
    .default("in_progress")
    .notNull(),

  remarks: text("remarks"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});