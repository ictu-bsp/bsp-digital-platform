// src/db/queries/reports.queries.ts
//
// Read-only report queries for /admin/reports.
// Does NOT touch admin.service.ts or any schema files (Reuben's files) —
// this is a brand new, isolated query module.
//
// IMPORTANT KNOWN LIMITATION:
// The `payments` table has no `amount` or `paymentMethod` column.
// Amounts below are ESTIMATES computed as (registrationYears * FEE_PER_YEAR).
// Payment method breakdown (card/gcash/grabpay/etc.) is NOT available in the
// DB at all — PayMongo's API would need to be called per paymentIntentId to
// get the real method, which is not done here. Confirmed with Andrei: fee is
// ₱50/year.

import { db } from "@/db";
import { sql, eq, and } from "drizzle-orm";
import {
  scoutApplications,
  payments,
  registrations,
  councils,
  regions,
  activities,
  activityRegistrations,
  scouts,
  users,
} from "@/db/schema";

const FEE_PER_YEAR = 50;

// ---------------------------------------------------------------------------
// 1. Registration Summary — scoutApplications grouped by status
// ---------------------------------------------------------------------------
export async function getRegistrationSummary() {
  const rows = await db
    .select({
      status: scoutApplications.status,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(scoutApplications)
    .groupBy(scoutApplications.status);

  const total = rows.reduce((sum, r) => sum + r.count, 0);

  return { byStatus: rows, total };
}

// ---------------------------------------------------------------------------
// 2. Payment Collections — payments joined to registrations, grouped by
//    paymentStatus. Amount is an ESTIMATE (registrationYears * 50).
// ---------------------------------------------------------------------------
export async function getPaymentCollectionsSummary() {
  const rows = await db
    .select({
      paymentStatus: payments.paymentStatus,
      count: sql<number>`count(*)`.mapWith(Number),
      estimatedAmount: sql<number>`coalesce(sum(${registrations.registrationYears} * ${FEE_PER_YEAR}), 0)`.mapWith(
        Number
      ),
    })
    .from(payments)
    .innerJoin(registrations, eq(payments.registrationId, registrations.id))
    .groupBy(payments.paymentStatus);

  const totalEstimatedAmount = rows.reduce((sum, r) => sum + r.estimatedAmount, 0);

  return {
    byStatus: rows,
    totalEstimatedAmount,
    note: "Amounts are estimates (registrationYears x PHP 50/year). Payment method breakdown is not available — the payments table does not store a method column.",
  };
}

// ---------------------------------------------------------------------------
// 3. Registrations by Region/Council
// ---------------------------------------------------------------------------
export async function getRegistrationsByRegionCouncil() {
  const rows = await db
    .select({
      regionName: regions.name,
      councilName: councils.name,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(registrations)
    .innerJoin(councils, eq(registrations.councilId, councils.id))
    .leftJoin(regions, eq(councils.regionId, regions.id))
    .groupBy(regions.name, councils.name)
    .orderBy(regions.name, councils.name);

  return rows;
}

// ---------------------------------------------------------------------------
// 4. Registrations Over Time — scoutApplications.createdAt grouped by month
// ---------------------------------------------------------------------------
export async function getRegistrationsOverTime(startDate?: Date, endDate?: Date) {
  const conditions = [];
  if (startDate) conditions.push(sql`${scoutApplications.createdAt} >= ${startDate}`);
  if (endDate) conditions.push(sql`${scoutApplications.createdAt} <= ${endDate}`);

  const rows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${scoutApplications.createdAt}), 'YYYY-MM')`,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(scoutApplications)
    .where(conditions.length ? and(...conditions) : undefined)
    .groupBy(sql`date_trunc('month', ${scoutApplications.createdAt})`)
    .orderBy(sql`date_trunc('month', ${scoutApplications.createdAt})`);

  return rows;
}

// ---------------------------------------------------------------------------
// 5. Membership Fee Revenue by Tenure (registrationYears) — paid only
// ---------------------------------------------------------------------------
export async function getRevenueByTenure() {
  const rows = await db
    .select({
      registrationYears: registrations.registrationYears,
      count: sql<number>`count(*)`.mapWith(Number),
      estimatedRevenue: sql<number>`coalesce(sum(${registrations.registrationYears} * ${FEE_PER_YEAR}), 0)`.mapWith(
        Number
      ),
    })
    .from(payments)
    .innerJoin(registrations, eq(payments.registrationId, registrations.id))
    .where(eq(payments.paymentStatus, "paid"))
    .groupBy(registrations.registrationYears)
    .orderBy(registrations.registrationYears);

  return rows;
}

// ---------------------------------------------------------------------------
// 6a. Activities & Enrollment counts — one row per activity
// ---------------------------------------------------------------------------
export async function getActivitiesSummary() {
  const rows = await db
    .select({
      activityId: activities.id,
      title: activities.title,
      category: activities.category,
      startDate: activities.startDate,
      endDate: activities.endDate,
      location: activities.location,
      maxParticipants: activities.maxParticipants,
      isPublished: activities.isPublished,
      enrolledCount: sql<number>`count(${activityRegistrations.id})`.mapWith(Number),
    })
    .from(activities)
    .leftJoin(activityRegistrations, eq(activityRegistrations.activityId, activities.id))
    .groupBy(
      activities.id,
      activities.title,
      activities.category,
      activities.startDate,
      activities.endDate,
      activities.location,
      activities.maxParticipants,
      activities.isPublished
    )
    .orderBy(activities.startDate);

  return rows;
}

// ---------------------------------------------------------------------------
// 6b. Drill-down: scouts enrolled in a specific activity, with their info
// ---------------------------------------------------------------------------
export async function getActivityEnrollees(activityId: string) {
  const rows = await db
    .select({
      registrationId: activityRegistrations.id,
      registeredAt: activityRegistrations.registeredAt,
      remarks: activityRegistrations.remarks,
      scoutId: scouts.id,
      membershipNumber: scouts.membershipNumber,
      rank: scouts.rank,
      scoutStatus: scouts.status,
      firstName: users.firstName,
      middleName: users.middleName,
      lastName: users.lastName,
      email: users.email,
      gender: users.gender,
      birthdate: users.birthdate,
    })
    .from(activityRegistrations)
    .innerJoin(scouts, eq(activityRegistrations.scoutId, scouts.id))
    .innerJoin(users, eq(scouts.userId, users.id))
    .where(eq(activityRegistrations.activityId, activityId))
    .orderBy(activityRegistrations.registeredAt);

  return rows;
}

// ---------------------------------------------------------------------------
// Convenience: fetch all 6 reports at once for the main reports page
// ---------------------------------------------------------------------------
export async function getAllReports() {
  const [
    registrationSummary,
    paymentCollections,
    registrationsByRegionCouncil,
    registrationsOverTime,
    revenueByTenure,
    activitiesSummary,
  ] = await Promise.all([
    getRegistrationSummary(),
    getPaymentCollectionsSummary(),
    getRegistrationsByRegionCouncil(),
    getRegistrationsOverTime(),
    getRevenueByTenure(),
    getActivitiesSummary(),
  ]);

  return {
    registrationSummary,
    paymentCollections,
    registrationsByRegionCouncil,
    registrationsOverTime,
    revenueByTenure,
    activitiesSummary,
  };
}