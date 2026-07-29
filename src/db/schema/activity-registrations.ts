//src/db/schema/activity-registrations.ts

import {
  pgTable,
  uuid,
  timestamp,
  text,
  boolean,
} from "drizzle-orm/pg-core";

import { activities } from "./activities";
import { scouts } from "./scouts";
import {
  applicationStatusEnum,
  paymentStatusEnum,
} from "./enums";

export const activityRegistrations = pgTable(
  "activity_registrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    scoutId: uuid("scout_id")
      .references(() => scouts.id)
      .notNull(),

    activityId: uuid("activity_id")
      .references(() => activities.id)
      .notNull(),

    registeredAt: timestamp("registered_at")
      .defaultNow()
      .notNull(),

    remarks: text("remarks"),

    //REGISTRATION WORKFLOW

    registrationStatus: applicationStatusEnum("registration_status")
      .default("PENDING")
      .notNull(),

    //REQUIREMENTS

    parentConsentFile: text("parent_consent_file"),

    parentGuardianIdFile: text("parent_guardian_id_file"),

    medicalCertificateFile: text("medical_certificate_file"),

    medicalWaiverFile: text("medical_waiver_file"),

    requirementsSubmitted: boolean("requirements_submitted")
      .default(false)
      .notNull(),

    //PAYMENT

    paymentStatus: paymentStatusEnum("payment_status")
      .default("awaiting_payment")
      .notNull(),

    paymentReferenceId: uuid("payment_reference_id"),

    registrationFee: text("registration_fee"),

    refundedAt: timestamp("refunded_at"),

    //UNIT LEADER APPROVAL

    unitLeaderApproved: boolean("unit_leader_approved")
      .default(false)
      .notNull(),

    unitLeaderApprovedBy: uuid("unit_leader_approved_by"),

    unitLeaderApprovedAt: timestamp("unit_leader_approved_at"),

    //POSTING ADMIN APPROVAL

    adminApproved: boolean("admin_approved")
      .default(false)
      .notNull(),

    adminApprovedBy: uuid("admin_approved_by"),

    adminApprovedAt: timestamp("admin_approved_at"),

    //JOIN STATUS

    joinedAt: timestamp("joined_at"),

    leftAt: timestamp("left_at"),

    //REJECTION

    rejectionReason: text("rejection_reason"),

    rejectedBy: uuid("rejected_by"),

    rejectedAt: timestamp("rejected_at"),
  }
);