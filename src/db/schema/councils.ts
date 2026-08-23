// src/db/schema/councils.ts

import { pgTable, text, uuid, integer } from "drizzle-orm/pg-core";
import { regions } from "./regions";

export const councils = pgTable("councils", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").unique().notNull(),
  councilNumber: text("council_number").notNull(), // e.g., "01", "12"
  regionId: uuid("region_id")
    .references(() => regions.id)
    .notNull(),
});

// Atomic counter table to prevent race conditions during concurrent registrations
// export const councilSequences = pgTable("council_sequences", {
//   councilId: uuid("council_id")
//     .primaryKey()
//     .references(() => councils.id, { onDelete: "cascade" }),
//   lastSequence: integer("last_sequence").notNull().default(0),
// });

// Global sequence tracker for national numbering
export const nationalSequences = pgTable("national_sequences", {
  id: text("id").primaryKey(), // e.g. "SCOUT_MEMBERSHIP_NATIONAL"
  lastSequence: integer("last_sequence").notNull().default(0),
});
