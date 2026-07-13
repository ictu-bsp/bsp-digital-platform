// src/db/schema/registrations.ts

import {
  pgTable,
  uuid,
  integer,
  date,
  timestamp,
  text,
} from "drizzle-orm/pg-core";

import { scouts } from "./scouts";
import { registrationStatusEnum } from "./enums";

export const registrations = pgTable("scout_registrations", {
  id: uuid("id").defaultRandom().primaryKey(),

  scoutId: uuid("scout_id")
    .references(() => scouts.id)
    .notNull(),

  registrationYears: integer("registration_years")
    .default(1)
    .notNull(),

  startDate: date("start_date").notNull(),

  endDate: date("end_date").notNull(),

  status: registrationStatusEnum("status")
    .default("pending")
    .notNull(),

  remarks: text("remarks"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});