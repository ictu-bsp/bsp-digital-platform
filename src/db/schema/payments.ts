// src/db/schema/payments.ts

import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { paymentStatusEnum } from "./enums";
import { registrations } from "./scout-registrations";

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),

  registrationId: uuid("registration_id")
    .references(() => registrations.id)
    .notNull(),

  paymentIntentId: text("payment_intent_id"),

  paymentStatus: paymentStatusEnum("payment_status")
    .default("awaiting_payment")
    .notNull(),

  paymentMethod: varchar("payment_method", { length: 20 }),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});