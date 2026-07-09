// src/db/schema/admin.ts

import {
  pgTable,
  uuid,
  timestamp,
  text,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { roles } from "./roles";

export const administrators = pgTable("administrators", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  roleId: uuid("role_id")
    .references(() => roles.id)
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