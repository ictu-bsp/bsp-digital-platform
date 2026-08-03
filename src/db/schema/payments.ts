// src/db/schema/payments.ts
import {
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { paymentStatusEnum } from "./enums";
import { registrations } from "./scout-registrations";
import { scoutApplications } from "./scoutApplications";

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Nullable -- a payment can exist for a brand-new application before any
  // registration record has been created yet. At least one of
  // registrationId/applicationId should always be set (enforced in
  // application code, not a DB constraint).
  registrationId: uuid("registration_id")
    .references(() => registrations.id),

  applicationId: uuid("application_id")
    .references(() => scoutApplications.id),

  paymentIntentId: text("payment_intent_id"),

  // Added missing fields used by updateRegistrationPaymentStatus in admin.service
  amount: integer("amount").default(0).notNull(),
  paymentStatus: paymentStatusEnum("payment_status")
    .default("awaiting_payment")
    .notNull(),

  paymentMethod: varchar("payment_method", { length: 20 }),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .defaultNow()
    .notNull(),
});