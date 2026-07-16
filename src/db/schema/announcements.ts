import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { councils } from "./councils";

export const announcementVisibility = pgEnum(
  "announcement_visibility",
  [
    "PUBLIC",
    "SCOUTS",
    "COUNCIL",
  ]
);

export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    title: varchar("title", {
      length: 150,
    }).notNull(),

    content: text("content").notNull(),

    imageUrl: text("image_url"),

    visibility:
      announcementVisibility(
        "visibility"
      )
        .default("PUBLIC")
        .notNull(),

    councilId: uuid("council_id").references(
      () => councils.id
    ),

    authorId: uuid("author_id")
      .references(() => users.id)
      .notNull(),

    isPinned: boolean("is_pinned")
      .default(false)
      .notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  }
);