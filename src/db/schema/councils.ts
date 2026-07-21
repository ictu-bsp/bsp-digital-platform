// src/db/schema/councils.ts

import {
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { regions } from "./regions";

export const councils = pgTable("councils", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name")
    .unique()
    .notNull(),

  regionId: uuid("region_id")
    .references(() => regions.id),
});