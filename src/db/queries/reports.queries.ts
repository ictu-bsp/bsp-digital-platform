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
import { sql, eq, and, inArray, gte, lte } from "drizzle-orm";
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




// ---------------------------------------------------------------------------
// Shared report filters — applied across queries where the underlying table
// has a matching column. Not every filter applies to every report (e.g.
// "rank" has no meaning for payment collections) — each function below
// only consumes the filters it can actually use.
// ---------------------------------------------------------------------------
export type ReportFilters = {
  dateFrom?: Date;
  dateTo?: Date;
  councilId?: string;
  scoutStatus?: string; // matches scoutStatusEnum values
  rank?: string; // matches scoutRankEnum values
};




const FEE_PER_YEAR = 50;

// ---------------------------------------------------------------------------
// 1. Registration Summary — scoutApplications grouped by status
// ---------------------------------------------------------------------------
export async function getRegistrationSummary(filters: ReportFilters = {}) {
  const conditions = [];
  if (filters.dateFrom) conditions.push(gte(scoutApplications.createdAt, filters.dateFrom));
  if (filters.dateTo) conditions.push(lte(scoutApplications.createdAt, filters.dateTo));
  if (filters.councilId) conditions.push(eq(scoutApplications.preferredCouncilId, filters.councilId));

  const rows = await db
    .select({
      status: scoutApplications.status,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(scoutApplications)
    .where(conditions.length ? and(...conditions) : undefined)
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
export async function getRegistrationsByRegionCouncil(filters: ReportFilters = {}) {
  const conditions = [];
  if (filters.councilId) conditions.push(eq(registrations.councilId, filters.councilId));
  if (filters.dateFrom) conditions.push(gte(registrations.createdAt, filters.dateFrom));
  if (filters.dateTo) conditions.push(lte(registrations.createdAt, filters.dateTo));

  const rows = await db
    .select({
      regionName: regions.name,
      councilName: councils.name,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(registrations)
    .innerJoin(councils, eq(registrations.councilId, councils.id))
    .leftJoin(regions, eq(councils.regionId, regions.id))
    .where(conditions.length ? and(...conditions) : undefined)
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
// 5b. Registration Type Breakdown — New vs Renewal.
//    A registration counts as a "Renewal" if the same scout already has an
//    earlier registration row (by createdAt). This mirrors the same logic
//    admin.service.ts uses for isExistingScout, so the numbers here match
//    what Membership Review / Finance show — just aggregated.
// ---------------------------------------------------------------------------
export async function getRegistrationTypeBreakdown() {
  const rows = await db
    .select({
      scoutId: registrations.scoutId,
      createdAt: registrations.createdAt,
    })
    .from(registrations)
    .orderBy(registrations.scoutId, registrations.createdAt);

  const seenScouts = new Set<string>();
  let newCount = 0;
  let renewalCount = 0;

  for (const row of rows) {
    if (seenScouts.has(row.scoutId)) {
      renewalCount += 1;
    } else {
      newCount += 1;
      seenScouts.add(row.scoutId);
    }
  }

  return {
    new: newCount,
    renewal: renewalCount,
    total: rows.length,
  };
}



// ---------------------------------------------------------------------------
// 6a. Activities & Enrollment counts — one row per activity.
//    organizerName is left-joined since activities.createdBy is currently
//    null for older rows (not yet wired to the logged-in admin's session —
//    flagged separately). computedStatus is DERIVED from startDate/endDate
//    vs. today; there is no status/cancelled column in the schema, so
//    "cancelled" is not representable here.
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
      organizerFirstName: users.firstName,
      organizerLastName: users.lastName,
      enrolledCount: sql<number>`count(${activityRegistrations.id})`.mapWith(Number),
    })
    .from(activities)
    .leftJoin(activityRegistrations, eq(activityRegistrations.activityId, activities.id))
    .leftJoin(users, eq(activities.createdBy, users.id))
    .groupBy(
      activities.id,
      activities.title,
      activities.category,
      activities.startDate,
      activities.endDate,
      activities.location,
      activities.maxParticipants,
      activities.isPublished,
      users.firstName,
      users.lastName
    )
    .orderBy(activities.startDate);

  const now = new Date();

  return rows.map((row) => {
    const start = new Date(row.startDate);
    const end = row.endDate ? new Date(row.endDate) : start;

    let computedStatus: "upcoming" | "ongoing" | "completed";
    if (now < start) computedStatus = "upcoming";
    else if (now > end) computedStatus = "completed";
    else computedStatus = "ongoing";

    return {
      activityId: row.activityId,
      title: row.title,
      category: row.category,
      startDate: row.startDate,
      endDate: row.endDate,
      location: row.location,
      maxParticipants: row.maxParticipants,
      isPublished: row.isPublished,
      organizerName:
        row.organizerFirstName && row.organizerLastName
          ? `${row.organizerFirstName} ${row.organizerLastName}`
          : "Unknown / System",
      computedStatus,
      enrolledCount: row.enrolledCount,
    };
  });
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
      registrationCreatedAt: registrations.createdAt,
    })
    .from(registrations)
    .innerJoin(scouts, eq(registrations.scoutId, scouts.id))
    .innerJoin(users, eq(scouts.userId, users.id))
    .innerJoin(councils, eq(registrations.councilId, councils.id))
    .leftJoin(regions, eq(councils.regionId, regions.id))
    .orderBy(users.lastName);

  const registrationIds = baseRows.map((r) => r.registrationId);
  const scoutIds = baseRows.map((r) => r.scoutId);

  const rawPayments = registrationIds.length
    ? await db
        .select({
          registrationId: payments.registrationId,
          paymentStatus: payments.paymentStatus,
          paymentMethod: payments.paymentMethod,
          createdAt: payments.createdAt,
        })
        .from(payments)
        .where(inArray(payments.registrationId, registrationIds))
    : [];

  // One payment per registration — prefer most recent "paid", else most recent overall.

  const bestPaymentByReg = new Map<
    string,
    { paymentStatus: string; paymentMethod: string | null; createdAt: Date }
  >();
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

  // Determine, per scout, which registrationId was their earliest — that
  // one is "New", everything else for the same scout is a "Renewal".
  const earliestRegByScout = new Map<string, string>();
  const sortedByScoutThenDate = [...baseRows].sort((a, b) => {
    if (a.scoutId !== b.scoutId) return a.scoutId < b.scoutId ? -1 : 1;
    return (
      new Date(a.registrationCreatedAt).getTime() -
      new Date(b.registrationCreatedAt).getTime()
    );
  });
  for (const row of sortedByScoutThenDate) {
    if (!earliestRegByScout.has(row.scoutId)) {
      earliestRegByScout.set(row.scoutId, row.registrationId);
    }
  }

  return baseRows.map((row) => {
    const bestPayment = bestPaymentByReg.get(row.registrationId);
    const isPaid = bestPayment?.paymentStatus === "paid";
    const registrationType =
      earliestRegByScout.get(row.scoutId) === row.registrationId
        ? "New"
        : "Renewal";

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
      registrationType: registrationType,
      paymentStatus: bestPayment?.paymentStatus ?? "no_payment",
      paymentMethod: bestPayment?.paymentMethod ?? null,
      estimatedAmountPaid: isPaid ? row.registrationYears * FEE_PER_YEAR : 0,
      paymentDate: bestPayment?.createdAt ? bestPayment.createdAt.toISOString() : null,
      activitiesEnrolled: activitiesByScout.get(row.scoutId) ?? [],
    };
  });
}



// ---------------------------------------------------------------------------
// 8. Membership Summary — scouts grouped by status (PENDING/ACTIVE/SUSPENDED/
//    EXPIRED) with an active/inactive split via scouts.isActive.
//    NOTE: no "leaders" breakdown is possible — there is no leaders table or
//    persistent scoutingPosition column on `scouts`. Flagged to Reuben.
// ---------------------------------------------------------------------------
export async function getMembershipSummary(filters: ReportFilters = {}) {
  const conditions = [];
  if (filters.councilId) conditions.push(eq(scouts.councilId, filters.councilId));
  if (filters.scoutStatus) conditions.push(eq(scouts.status, filters.scoutStatus as any));
  if (filters.rank) conditions.push(eq(scouts.rank, filters.rank as any));
  if (filters.dateFrom) conditions.push(gte(scouts.createdAt, filters.dateFrom));
  if (filters.dateTo) conditions.push(lte(scouts.createdAt, filters.dateTo));

  const rows = await db
    .select({
      status: scouts.status,
      isActive: scouts.isActive,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(scouts)
    .where(conditions.length ? and(...conditions) : undefined)
    .groupBy(scouts.status, scouts.isActive);

  const byStatusMap = new Map<string, number>();
  for (const row of rows) {
    byStatusMap.set(row.status, (byStatusMap.get(row.status) ?? 0) + row.count);
  }

  const total = rows.reduce((sum, r) => sum + r.count, 0);
  const activeCount = rows.filter((r) => r.isActive).reduce((sum, r) => sum + r.count, 0);
  const inactiveCount = total - activeCount;

  return {
    byStatus: Array.from(byStatusMap.entries()).map(([status, count]) => ({ status, count })),
    total,
    activeCount,
    inactiveCount,
  };
}

// ---------------------------------------------------------------------------
// 9. Membership Trends — new scouts per month, based on scouts.createdAt
// ---------------------------------------------------------------------------
export async function getMembershipTrends(filters: ReportFilters = {}) {
  const conditions = [];
  if (filters.councilId) conditions.push(eq(scouts.councilId, filters.councilId));
  if (filters.scoutStatus) conditions.push(eq(scouts.status, filters.scoutStatus as any));
  if (filters.rank) conditions.push(eq(scouts.rank, filters.rank as any));
  if (filters.dateFrom) conditions.push(gte(scouts.createdAt, filters.dateFrom));
  if (filters.dateTo) conditions.push(lte(scouts.createdAt, filters.dateTo));

  const rows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${scouts.createdAt}), 'YYYY-MM')`,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(scouts)
    .where(conditions.length ? and(...conditions) : undefined)
    .groupBy(sql`date_trunc('month', ${scouts.createdAt})`)
    .orderBy(sql`date_trunc('month', ${scouts.createdAt})`);

  return rows;
}



// ---------------------------------------------------------------------------
// 10. Scout Profiles — one row per scout with core identity, current status,
//    council/region, and a computed age. Registration history and activities
//    are attached separately to avoid row-duplication (same join-then-map
//    pattern as getEnrolleeDetailsReport()).
//    NOTE: no School, Scout Unit, or Leader fields exist in this schema —
//    intentionally omitted rather than faked. Flagged as a schema gap.
// ---------------------------------------------------------------------------
export async function getScoutProfilesReport(filters: ReportFilters = {}) {
  const conditions = [];
  if (filters.councilId) conditions.push(eq(scouts.councilId, filters.councilId));
  if (filters.scoutStatus) conditions.push(eq(scouts.status, filters.scoutStatus as any));
  if (filters.rank) conditions.push(eq(scouts.rank, filters.rank as any));
  if (filters.dateFrom) conditions.push(gte(scouts.createdAt, filters.dateFrom));
  if (filters.dateTo) conditions.push(lte(scouts.createdAt, filters.dateTo));

  const baseRows = await db
    .select({
      scoutId: scouts.id,
      membershipNumber: scouts.membershipNumber,
      rank: scouts.rank,
      status: scouts.status,
      isActive: scouts.isActive,
      joinedAt: scouts.joinedAt,
      firstName: users.firstName,
      middleName: users.middleName,
      lastName: users.lastName,
      email: users.email,
      birthdate: users.birthdate,
      councilName: councils.name,
      regionName: regions.name,
    })
    .from(scouts)
    .innerJoin(users, eq(scouts.userId, users.id))
    .innerJoin(councils, eq(scouts.councilId, councils.id))
    .leftJoin(regions, eq(councils.regionId, regions.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(users.lastName);

  const scoutIds = baseRows.map((r) => r.scoutId);

  // Registration history per scout (most recent first).
  const rawRegistrations = scoutIds.length
    ? await db
        .select({
          scoutId: registrations.scoutId,
          registrationId: registrations.id,
          status: registrations.status,
          registrationYears: registrations.registrationYears,
          startDate: registrations.startDate,
          endDate: registrations.endDate,
          createdAt: registrations.createdAt,
        })
        .from(registrations)
        .where(inArray(registrations.scoutId, scoutIds))
        .orderBy(registrations.scoutId, registrations.createdAt)
    : [];

  const registrationsByScout = new Map<string, typeof rawRegistrations>();
  for (const row of rawRegistrations) {
    const list = registrationsByScout.get(row.scoutId) ?? [];
    list.push(row);
    registrationsByScout.set(row.scoutId, list);
  }

  // Activities per scout (reusing the same lookup pattern already in this file).
  const rawActivityRegs = scoutIds.length
    ? await db
        .select({
          scoutId: activityRegistrations.scoutId,
          title: activities.title,
          registeredAt: activityRegistrations.registeredAt,
        })
        .from(activityRegistrations)
        .innerJoin(activities, eq(activityRegistrations.activityId, activities.id))
        .where(inArray(activityRegistrations.scoutId, scoutIds))
    : [];

  const activitiesByScout = new Map<string, { title: string; registeredAt: Date }[]>();
  for (const row of rawActivityRegs) {
    const list = activitiesByScout.get(row.scoutId) ?? [];
    list.push({ title: row.title, registeredAt: row.registeredAt });
    activitiesByScout.set(row.scoutId, list);
  }

  const calculateAge = (birthdate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthdate.getFullYear();
    const monthDiff = today.getMonth() - birthdate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
      age -= 1;
    }
    return age;
  };

  return baseRows.map((row) => ({
    scoutId: row.scoutId,
    membershipNumber: row.membershipNumber,
    firstName: row.firstName,
    middleName: row.middleName,
    lastName: row.lastName,
    email: row.email,
    age: calculateAge(new Date(row.birthdate)),
    rank: row.rank,
    status: row.status,
    isActive: row.isActive,
    councilName: row.councilName,
    regionName: row.regionName,
    joinedAt: row.joinedAt,
    registrationHistory: registrationsByScout.get(row.scoutId) ?? [],
    activitiesEnrolled: activitiesByScout.get(row.scoutId) ?? [],
  }));
}

// ---------------------------------------------------------------------------
// Convenience: fetch all 6 reports at once for the main reports page
// ---------------------------------------------------------------------------
export async function getAllReports(filters: ReportFilters = {}) {
  const [
    membershipSummary,
    membershipTrends,
    scoutProfiles,
    registrationSummary,
    paymentCollections,
    registrationsByRegionCouncil,
    registrationsOverTime,
    revenueByTenure,
    registrationTypeBreakdown,
    activitiesSummary,
    enrolleeDetails,
  ] = await Promise.all([
    getMembershipSummary(filters),
    getMembershipTrends(filters),
    getScoutProfilesReport(filters),
    getRegistrationSummary(filters),
    getPaymentCollectionsSummary(),
    getRegistrationsByRegionCouncil(filters),
    getRegistrationsOverTime(filters.dateFrom, filters.dateTo),
    getRevenueByTenure(),
    getRegistrationTypeBreakdown(),
    getActivitiesSummary(),
    getEnrolleeDetailsReport(),
  ]);

  return {
    membershipSummary,
    membershipTrends,
    scoutProfiles,
    registrationSummary,
    paymentCollections,
    registrationsByRegionCouncil,
    registrationsOverTime,
    revenueByTenure,
    registrationTypeBreakdown,
    activitiesSummary,
    enrolleeDetails,
  };
}