//src/db/schema/pending-user-registrations.ts

import {
  pgTable,
  uuid,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const pendingUserRegistrations = pgTable(
  "pending_user_registrations",
  {
    id: uuid(
      "id"
    ).defaultRandom().primaryKey(),

    email: text(
      "email"
    ).notNull().unique(),

    firstName: text(
      "first_name"
    ).notNull(),

    middleName: text("middle_name"),

    lastName: text(
      "last_name"
    ).notNull(),

    suffix: text("suffix"),

    birthdate: timestamp(
      "birthdate", 
      {
        mode: "date",
      }
    ).notNull(),

    sex: text(
      "sex"
    ).notNull(),

    role: text("role")
      .$type<"VISITOR" | "SCOUT">()
      .notNull(),

    verificationCode: text(
      "verification_code"
    ).notNull(),

    verificationExpires: timestamp(
      "verification_expires",
      {
        mode: "date",
      }
    ).notNull(),

    emailVerifiedAt: timestamp(
      "email_verified_at", 
      {
        mode: "date",
      }
    ),

    createdAt: timestamp(
      "created_at",
      {
        mode: "date",
      }
    ).defaultNow().notNull(),
  }
);