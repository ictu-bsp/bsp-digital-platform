//src/db/schema/adminUsers.ts

import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { councils } from "./councils";
import {adminRoleEnum } from "./enums";


export const adminUsers = pgTable("admin_users", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  councilId: uuid("council_id")
    .references(() => councils.id)
    .notNull(),

  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),

  username: text("username")
    .notNull()
    .unique(),

  passwordHash: text("password_hash")
    .notNull(),

  fullName: text("full_name")
    .notNull(),

  role: adminRoleEnum("role")
    .notNull(),

  active: boolean("active")
    .default(true)
    .notNull(),

  lastLoginAt: timestamp("last_login_at"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});