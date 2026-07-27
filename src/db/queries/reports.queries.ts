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
import { sql, eq, and, inArray } from "drizzle-orm";
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
// 2. Payment Collections — one payment picked per registration (prefer the
//    most recent "paid" row, else the most recent row overall) to avoid
//    double-counting a registration that has multiple payment attempts
//    (e.g. an old "awaiting_payment" retry row plus the final "paid" row).
//    Amount is an ESTIMATE (registrationYears * 50).
// ---------------------------------------------------------------------------
export async function getPaymentCollectionsSummary() {
  const rawRows = await db
    .select({
      registrationId: payments.registrationId,
      paymentStatus: payments.paymentStatus,
      createdAt: payments.createdAt,
      registrationYears: registrations.registrationYears,
    })
    .from(payments)
    .innerJoin(registrations, eq(payments.registrationId, registrations.id));

  // Dedupe: keep exactly one payment row per registrationId.
  const winnerByRegistration = new Map<string, (typeof rawRows)[number]>();

  for (const row of rawRows) {
    const existing = winnerByRegistration.get(row.registrationId);
    if (!existing) {
      winnerByRegistration.set(row.registrationId, row);
      continue;
    }

    const rowIsPaid = row.paymentStatus === "paid";
    const existingIsPaid = existing.paymentStatus === "paid";

    if (rowIsPaid && !existingIsPaid) {
      // Prefer a "paid" row over a non-paid row.
      winnerByRegistration.set(row.registrationId, row);
    } else if (rowIsPaid === existingIsPaid) {
      // Same "paid-ness" — prefer the more recent createdAt.
      if (new Date(row.createdAt).getTime() > new Date(existing.createdAt).getTime()) {
        winnerByRegistration.set(row.registrationId, row);
      }
    }
    // else: existing is already "paid" and row isn't — keep existing.
  }

  const winners = Array.from(winnerByRegistration.values());

  // Now group the deduped winners by paymentStatus.
  const grouped = new Map<string, { count: number; estimatedAmount: number }>();

  for (const row of winners) {
    const bucket = grouped.get(row.paymentStatus) ?? { count: 0, estimatedAmount: 0 };
    bucket.count += 1;
    bucket.estimatedAmount += row.registrationYears * FEE_PER_YEAR;
    grouped.set(row.paymentStatus, bucket);
  }

  const byStatus = Array.from(grouped.entries()).map(([paymentStatus, v]) => ({
    paymentStatus,
    count: v.count,
    estimatedAmount: v.estimatedAmount,
  }));

  const totalEstimatedAmount = byStatus.reduce((sum, r) => sum + r.estimatedAmount, 0);

  return {
    byStatus,
    totalEstimatedAmount,
    note: "Amounts are estimates (registrationYears x PHP 50/year), one payment counted per registration. Payment method breakdown is not available — the payments table does not store a method column.",
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
// 7. Enrollee Details — one row per scout registration: who they are,
//    what they paid (estimated), and what activities they enrolled in.
//    Fetches payments and activity enrollments separately (not via
//    leftJoin) to avoid row-duplication, same pattern as getPaymentCollectionsSummary().
// ---------------------------------------------------------------------------
export async function getEnrolleeDetailsReport() {
  const baseRows = await db
    .select({
      registrationId: registrations.id,
      scoutId: scouts.id,
      membershipNumber: scouts.membershipNumber,
      firstName: users.firstName,
      middleName: users.middleName,
      lastName: users.lastName,
      email: users.email,
      councilName: councils.name,
      regionName: regions.name,
      registrationYears: registrations.registrationYears,
      registrationStatus: registrations.status,
    })
    .from(registrations)
    .innerJoin(scouts, eq(registrations.scoutId, scouts.id))
    .innerJoin(users, eq(scouts.userId, users.id))
    .innerJoin(councils, eq(registrations.councilId, councils.id))
    .leftJoin(regions, eq(councils.regionId, regions.id))
    .orderBy(users.lastName);

  const registrationIds = baseRows.map((r) => r.registrationId);
  const scoutIds = baseRows.map((r) => r.scoutId);

  // One payment per registration — prefer most recent "paid", else most recent overall.
  const rawPayments = registrationIds.length
    ? await db
        .select({
          registrationId: payments.registrationId,
          paymentStatus: payments.paymentStatus,
          createdAt: payments.createdAt,
        })
        .from(payments)
        .where(inArray(payments.registrationId, registrationIds))
    : [];

  const bestPaymentByReg = new Map<string, { paymentStatus: string; createdAt: Date }>();
  for (const row of rawPayments) {
    const existing = bestPaymentByReg.get(row.registrationId);
    if (!existing) {
      bestPaymentByReg.set(row.registrationId, row);
      continue;
    }
    const rowPaid = row.paymentStatus === "paid";
    const existingPaid = existing.paymentStatus === "paid";
    if (rowPaid && !existingPaid) {
      bestPaymentByReg.set(row.registrationId, row);
    } else if (rowPaid === existingPaid && new Date(row.createdAt) > new Date(existing.createdAt)) {
      bestPaymentByReg.set(row.registrationId, row);
    }
  }

  // All activities a scout enrolled in, grouped by scoutId.
  const rawActivityRegs = scoutIds.length
    ? await db
        .select({
          scoutId: activityRegistrations.scoutId,
          title: activities.title,
        })
        .from(activityRegistrations)
        .innerJoin(activities, eq(activityRegistrations.activityId, activities.id))
        .where(inArray(activityRegistrations.scoutId, scoutIds))
    : [];

  const activitiesByScout = new Map<string, string[]>();
  for (const row of rawActivityRegs) {
    const list = activitiesByScout.get(row.scoutId) ?? [];
    list.push(row.title);
    activitiesByScout.set(row.scoutId, list);
  }

  return baseRows.map((row) => {
    const bestPayment = bestPaymentByReg.get(row.registrationId);
    const isPaid = bestPayment?.paymentStatus === "paid";

    return {
      scoutId: row.scoutId,
      membershipNumber: row.membershipNumber,
      firstName: row.firstName,
      middleName: row.middleName,
      lastName: row.lastName,
      email: row.email,
      councilName: row.councilName,
      regionName: row.regionName,
      registrationYears: row.registrationYears,
      registrationStatus: row.registrationStatus,
      paymentStatus: bestPayment?.paymentStatus ?? "no_payment",
      estimatedAmountPaid: isPaid ? row.registrationYears * FEE_PER_YEAR : 0,
      activitiesEnrolled: activitiesByScout.get(row.scoutId) ?? [],
    };
  });
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
    enrolleeDetails,
  ] = await Promise.all([
    getRegistrationSummary(),
    getPaymentCollectionsSummary(),
    getRegistrationsByRegionCouncil(),
    getRegistrationsOverTime(),
    getRevenueByTenure(),
    getActivitiesSummary(),
    getEnrolleeDetailsReport(),
  ]);

  return {
    registrationSummary,
    paymentCollections,
    registrationsByRegionCouncil,
    registrationsOverTime,
    revenueByTenure,
    activitiesSummary,
    enrolleeDetails,
  };
}