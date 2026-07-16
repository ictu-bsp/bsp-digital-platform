//src/db/relations/councils.ts

import { relations } from "drizzle-orm";

import { councils } from "../schema/councils";
import { activities } from "../schema/activities";

export const councilsRelations = relations(
  councils,
  ({ many }) => ({
    activities: many(activities),
  })
);