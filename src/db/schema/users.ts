// src/db/schema/users.ts

import {
  pgTable,
  text,
  timestamp,
  uuid,
  date,
} from "drizzle-orm/pg-core";

import { councils } from "./councils";

export const users = pgTable("users", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  email: text("email")
    .unique()
    .notNull(),

  emailVerified: timestamp("email_verified"),

  passwordHash: text("password_hash")
    .notNull(),

  firstName: text("first_name")
    .notNull(),

  middleName: text("middle_name"),

  lastName: text("last_name")
    .notNull(),

  suffix: text("suffix"),

  birthdate: date("birthdate", {
    mode: "date",
  }).notNull(),

  sex: text("sex")
    .notNull(),

  role: text("role")
    .$type<
      | "VISITOR"
      | "SCOUT"
      | "COUNCIL_ADMIN"
      | "SUPER_ADMIN"
    >()
    .default("VISITOR")
    .notNull(),

  /**
   * Nullable for Visitors and Scouts.
   * Required for Council Admins.
   */
  councilId: uuid("council_id")
    .references(() => councils.id),

  avatarUrl: text("avatar_url"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});

import { z } from "zod";

const SEX_ENUM = z.enum(["MALE", "FEMALE"]);

export const nonVerifiedScoutSchema = z.object({
  userID: z.string().uuid(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  suffix: z.string().optional(),
  birthdate: z.string(), // ISO format (YYYY-MM-DD)
  sex: SEX_ENUM,
  email: z.string().email(),
});