// src/db/schema/adminUsers.ts

import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  date,
  unique,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { councils } from "./councils";
import { regions } from "./regions";
import { adminRoleEnum, adminScopeEnum } from "./enums";

export const adminUsers = pgTable(
  "admin_users",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    scope: adminScopeEnum("scope")
      .notNull()
      .default("COUNCIL"),

    councilId: uuid("council_id")
      .references(() => councils.id),

    regionId: uuid("region_id")
      .references(() => regions.id),

    createdBy: uuid("created_by")
      .references(() => users.id)
      .notNull(),

    // REMOVED .unique() HERE:
    username: text("username")
      .notNull(),

    passwordHash: text("password_hash")
      .notNull(),

    fullName: text("full_name")
      .notNull(),

    firstName: text("first_name"),
    lastName: text("last_name"),

    role: adminRoleEnum("role")
      .notNull(),

    active: boolean("active")
      .default(true)
      .notNull(),

    lastLoginAt: timestamp("last_login_at"),

    passwordExpiration: date("password_expiration", { mode: "date" }),
    accountLockThreshold: integer("account_lock_threshold").default(5),
    incorrectPasswordAttempts: integer("incorrect_password_attempts").default(0).notNull(),
    locked: boolean("locked").default(false).notNull(),

    email: text("email"),
    alternateEmail: text("alternate_email"),
    profilePicture: text("profile_picture"),

    firstTimeUser: boolean("first_time_user").default(true).notNull(),
    canChangePassword: boolean("can_change_password").default(true).notNull(),
    turnOffEmailNotif: boolean("turn_off_email_notif").default(false).notNull(),

    addedBy: uuid("added_by").references((): any => adminUsers.id),
    deletedAt: timestamp("deleted_date"),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    // Ensures usernames are unique PER COUNCIL and PER REGION
    councilUsernameUnq: unique("admin_users_council_username_unq").on(
      table.councilId,
      table.username
    ),
    regionUsernameUnq: unique("admin_users_region_username_unq").on(
      table.regionId,
      table.username
    ),
  })
);