// src/db/relations/sessions.ts

import { relations } from "drizzle-orm";

import { sessions } from "../schema/sessions";
import { users } from "../schema/users";
import { adminUsers } from "../schema/adminUsers";

export const sessionsRelations = relations(
  sessions,
  ({ one }) => ({
    user: one(users, {
      fields: [sessions.userId],
      references: [users.id],
    }),
    adminUser: one(adminUsers, {
      fields: [sessions.adminUserId],
      references: [adminUsers.id],
    }),
  })
);