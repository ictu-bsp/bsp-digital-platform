import { relations } from "drizzle-orm/relations";
import { users, administrators, councils, scouts, advancements, registrations, payments } from "./schema";

export const administratorsRelations = relations(administrators, ({one}) => ({
	user: one(users, {
		fields: [administrators.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	administrators: many(administrators),
	scouts: many(scouts),
}));

export const scoutsRelations = relations(scouts, ({one, many}) => ({
	council: one(councils, {
		fields: [scouts.councilId],
		references: [councils.id]
	}),
	user: one(users, {
		fields: [scouts.userId],
		references: [users.id]
	}),
	advancements: many(advancements),
	registrations: many(registrations),
}));

export const councilsRelations = relations(councils, ({many}) => ({
	scouts: many(scouts),
}));

export const advancementsRelations = relations(advancements, ({one}) => ({
	scout: one(scouts, {
		fields: [advancements.scoutId],
		references: [scouts.id]
	}),
}));

export const registrationsRelations = relations(registrations, ({one, many}) => ({
	scout: one(scouts, {
		fields: [registrations.scoutId],
		references: [scouts.id]
	}),
	payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	registration: one(registrations, {
		fields: [payments.registrationId],
		references: [registrations.id]
	}),
}));