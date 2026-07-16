//src/db/relations/users.ts

import { relations } from "drizzle-orm";

import { users } from "../schema/users";
import { activities } from "../schema/activities";

export const usersRelations = relations(
  users,
  ({ many }) => ({
    createdActivities: many(activities),
  })
);