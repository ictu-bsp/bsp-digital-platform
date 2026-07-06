import { pgTable, text, timestamp, integer, pgEnum, uuid } from 'drizzle-orm/pg-core';

export const paymentStatusEnum = pgEnum('payment_status', ['awaiting_payment', 'paid', 'failed']);
export const verificationStatusEnum = pgEnum('verification_status', ['unverified', 'pending', 'active']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  middleName: text('middle_name'),
  birthdate: text('birthdate').notNull(),
  council: text('council').notNull(),
  
  paymentStatus: paymentStatusEnum('payment_status').default('awaiting_payment').notNull(),
  paymentIntentId: text('payment_intent_id'), // PayMongo Reference
  registrationYears: integer('registration_years').default(1).notNull(),

  scoutIdNumber: text('scout_id_number'),
  verificationStatus: verificationStatusEnum('verification_status').default('unverified').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});