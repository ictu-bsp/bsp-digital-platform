// src/db/schema/regions.ts

import {
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

export const regions = pgTable("regions", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name")
    .unique()
    .notNull(),
});