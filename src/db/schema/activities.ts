// src/db/schema/activities.ts

import {
  pgTable,
  text,
  timestamp,
  uuid,
  date,
} from "drizzle-orm/pg-core";

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),

  title: text("title").notNull(),

  description: text("description"),

  activityDate: date("activity_date").notNull(),

  location: text("location"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});