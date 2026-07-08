// src/db/schema/roles.ts

import {
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name")
    .unique()
    .notNull(),

  description: text("description"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});