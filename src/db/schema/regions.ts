// src/db/schema/regions.ts

import {
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

export const regions = pgTable("regions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").unique().notNull(),
  regionNumber: text("region_number").unique().notNull(), // e.g., "01", "12"
});