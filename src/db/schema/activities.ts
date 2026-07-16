// src/db/schema/activities.ts

import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { activityCategoryEnum } from "./enums";

import { users } from "./users";

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Basic Information
  title: text("title").notNull(),

  description: text("description").notNull(),

  imageUrl: text("image_url"),

  // Schedule
  startDate: timestamp("start_date").notNull(),

  endDate: timestamp("end_date"),

  registrationDeadline: timestamp("registration_deadline"),

  // Location
  location: text("location").notNull(),

  // Classification
  category: activityCategoryEnum("category").notNull(),

  // Capacity
  maxParticipants: integer("max_participants"),

  // Visibility
  isPublished: boolean("is_published")
    .default(true)
    .notNull(),

  // Audit
  createdBy: uuid("created_by").references(() => users.id),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});