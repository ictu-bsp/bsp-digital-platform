// src/db/schema/notifications.ts

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { councils } from "./councils";
import { regions } from "./regions";

// Mirrors announcement_visibility in announcements.ts -- same four tiers,
// same meaning:
// PUBLIC   -> visible to everyone, including visitors
// SCOUTS   -> visible to any verified scout/admin, regardless of council/region
// COUNCIL  -> visible only within one specific council
// REGIONAL -> visible to every council within one specific region
export const notificationVisibility = pgEnum(
  "notification_visibility",
  [
    "PUBLIC",
    "SCOUTS",
    "COUNCIL",
    "REGIONAL",
  ]
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    title: varchar("title", {
      length: 150,
    }).notNull(),

    message: text("message").notNull(),

    // Optional link a notification can point to (e.g. an activity or
    // announcement detail page). Left as a plain string, not a foreign
    // key, since a notification can point to different kinds of content.
    link: text("link"),

    visibility:
      notificationVisibility(
        "visibility"
      )
        .default("PUBLIC")
        .notNull(),

    councilId: uuid("council_id").references(
      () => councils.id
    ),

    regionId: uuid("region_id").references(
      () => regions.id
    ),

    authorId: uuid("author_id")
      .references(() => users.id)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  }
);
