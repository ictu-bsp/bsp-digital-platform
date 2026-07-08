// src/db/schema/admin.ts

import {
  pgTable,
  uuid,
  timestamp,
  text,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const administrators = pgTable("administrators", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),

  position: text("position"),

  office: text("office"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});