// src/db/schema/enums.ts

import { pgEnum } from "drizzle-orm/pg-core";

export const paymentStatusEnum = pgEnum("payment_status", [
  "awaiting_payment",
  "paid",
  "failed",
]);

export const verificationStatusEnum = pgEnum("verification_status", [
  "unverified",
  "pending",
  "active",
]);

export const registrationStatusEnum = pgEnum("registration_status", [
  "pending",
  "active",
  "expired",
  "cancelled",
]);