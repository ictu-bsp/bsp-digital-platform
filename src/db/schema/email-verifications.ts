import {
  pgTable,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

import { users } from "./users";

export const emailVerifications = pgTable(
  "email_verifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),

    code: varchar("code", { length: 6 }).notNull(),

    expiresAt: timestamp("expires_at").notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  }
);