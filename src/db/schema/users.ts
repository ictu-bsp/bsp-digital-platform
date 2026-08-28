// src/db/schema/users.ts

import { pgTable, text, timestamp, uuid, date } from "drizzle-orm/pg-core";
import { z } from "zod";
import { councils } from "./councils";
import { regions } from "./regions";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified"),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  middleName: text("middle_name"),
  lastName: text("last_name").notNull(),
  suffix: text("suffix"),
  birthdate: date("birthdate", {
    mode: "date",
  }).notNull(),
  sex: text("sex").notNull(),
  role: text("role")
    .$type<
      | "VISITOR"
      | "SCOUT"
      | "COUNCIL_ADMIN"
      | "REGIONAL_ADMIN"
      | "NATIONAL_ADMIN"
      | "SUPER_ADMIN"
    >()
    .default("VISITOR")
    .notNull(),

  /**
   * Nullable for Visitors and Scouts.
   * Required for Council Admins.
   */
  councilId: uuid("council_id").references(() => councils.id),

  /**
   * Nullable except for Regional Admins, where it's required.
   */
  regionId: uuid("region_id").references(() => regions.id),

  avatarUrl: text("avatar_url"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});



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
