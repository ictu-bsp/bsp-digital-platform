//src/db/schema/sessions.ts

import {
  pgTable,
  uuid,
  timestamp,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { adminUsers } from "./adminUsers";

export const sessions = pgTable("sessions", {
  id: uuid("id")
    .defaultRandom()
    .primaryKey(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  // Officer selected after Council Admin login.
  // Scouts will simply leave this null.
  adminUserId: uuid("admin_user_id").references(
    () => adminUsers.id,
    {
      onDelete: "cascade",
    }
  ),

  expiresAt: timestamp("expires_at")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});