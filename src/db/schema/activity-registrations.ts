//src/db/schema/activity-registrations.ts

import {
  pgTable,
  uuid,
  timestamp,
  text,
} from "drizzle-orm/pg-core";

import { activities } from "./activities";
import { scouts } from "./scouts";

export const activityRegistrations = pgTable(
  "activity_registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    scoutId: uuid("scout_id")
      .references(() => scouts.id)
      .notNull(),

    activityId: uuid("activity_id")
      .references(() => activities.id)
      .notNull(),

    registeredAt: timestamp("registered_at")
      .defaultNow()
      .notNull(),

    remarks: text("remarks"),
  }
);