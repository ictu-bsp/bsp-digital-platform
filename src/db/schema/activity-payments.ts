//src/db/schema/activity-payments.ts

import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { paymentStatusEnum } from "./enums";
import { activityRegistrations } from "./activity-registrations";

export const activityPayments = pgTable("activity_payments", {
  id: uuid("id").defaultRandom().primaryKey(),

  registrationId: uuid("registration_id")
    .references(() => activityRegistrations.id)
    .notNull(),

  amount: integer("amount").notNull(),

  paymentIntentId: text("payment_intent_id"),

  paymentMethod: text("payment_method"),

  receiptNumber: text("receipt_number"),

  paymentStatus: paymentStatusEnum("payment_status")
    .default("awaiting_payment")
    .notNull(),

  refundedAt: timestamp("refunded_at"),

  refundReference: text("refund_reference"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});