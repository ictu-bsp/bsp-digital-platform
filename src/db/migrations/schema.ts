import { pgTable, uuid, text, date, timestamp, unique, foreignKey, integer, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const paymentStatus = pgEnum("payment_status", ['awaiting_payment', 'paid', 'failed'])
export const registrationStatus = pgEnum("registration_status", ['pending', 'active', 'expired', 'cancelled'])
export const verificationStatus = pgEnum("verification_status", ['unverified', 'pending', 'active'])


export const activities = pgTable("activities", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	activityDate: date("activity_date").notNull(),
	location: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const meritBadges = pgTable("merit_badges", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	category: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("merit_badges_name_unique").on(table.name),
]);

export const roles = pgTable("roles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("roles_name_unique").on(table.name),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	emailVerified: timestamp("email_verified", { mode: 'string' }),
	passwordHash: text("password_hash").notNull(),
	firstName: text("first_name").notNull(),
	middleName: text("middle_name"),
	lastName: text("last_name").notNull(),
	birthdate: date().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const administrators = pgTable("administrators", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	position: text(),
	office: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "administrators_user_id_users_id_fk"
		}),
]);

export const scouts = pgTable("scouts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	councilId: uuid("council_id").notNull(),
	userId: uuid("user_id").notNull(),
	scoutIdNumber: text("scout_id_number"),
	verificationStatus: verificationStatus("verification_status").default('unverified').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.councilId],
			foreignColumns: [councils.id],
			name: "scouts_council_id_councils_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "scouts_user_id_users_id_fk"
		}),
]);

export const advancements = pgTable("advancements", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	scoutId: uuid("scout_id").notNull(),
	rank: text().notNull(),
	status: text().default('in_progress').notNull(),
	remarks: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.scoutId],
			foreignColumns: [scouts.id],
			name: "advancements_scout_id_scouts_id_fk"
		}),
]);

export const registrations = pgTable("registrations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	scoutId: uuid("scout_id").notNull(),
	registrationYears: integer("registration_years").default(1).notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	status: registrationStatus().default('pending').notNull(),
	remarks: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.scoutId],
			foreignColumns: [scouts.id],
			name: "registrations_scout_id_scouts_id_fk"
		}),
]);

export const payments = pgTable("payments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	registrationId: uuid("registration_id").notNull(),
	paymentIntentId: text("payment_intent_id"),
	paymentStatus: paymentStatus("payment_status").default('awaiting_payment').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.registrationId],
			foreignColumns: [registrations.id],
			name: "payments_registration_id_registrations_id_fk"
		}),
]);

export const councils = pgTable("councils", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
}, (table) => [
	unique("councils_name_unique").on(table.name),
]);
