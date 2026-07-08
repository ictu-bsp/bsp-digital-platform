// src/db/schema/meritbadges.ts

import {
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const meritBadges = pgTable("merit_badges", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name")
    .unique()
    .notNull(),

  description: text("description"),

  category: text("category"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});