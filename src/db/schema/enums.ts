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

export const scoutStatusEnum = pgEnum(
  "scout_status",
  [
    "PENDING",
    "ACTIVE",
    "SUSPENDED",
    "EXPIRED",
  ]
);

export const scoutRankEnum = pgEnum(
  "scout_rank",
  [
    "KID",
    "KAB",
    "BOY",
    "SENIOR",
    "ROVER",
  ]
);

export const applicationStatusEnum = pgEnum(
  "application_status",
  [
    "PENDING",
    "APPROVED",
    "REJECTED",
    "CANCELLED",
  ]
);

export const activityCategoryEnum = pgEnum("activity_category", [
  "CAMPING",
  "TRAINING",
  "COMMUNITY_SERVICE",
  "SEMINAR",
  "COMPETITION",
  "CEREMONY",
  "MEETING",
  "OTHER",
]);