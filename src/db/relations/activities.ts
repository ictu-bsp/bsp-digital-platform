import { relations } from "drizzle-orm";

import { activities } from "../schema/activities";
import { councils } from "../schema/councils";
import { users } from "../schema/users";

export const activitiesRelations = relations(
  activities,
  ({ one }) => ({
    council: one(councils, {
      fields: [activities.councilId],
      references: [councils.id],
    }),

    creator: one(users, {
      fields: [activities.createdBy],
      references: [users.id],
    }),
  })
);