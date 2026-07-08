// src/db/schema/councils.ts

import {
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

export const councils = pgTable("councils", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name")
    .unique()
    .notNull(),
});