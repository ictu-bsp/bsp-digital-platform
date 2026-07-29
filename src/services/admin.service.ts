// src/services/admin.service.ts

import { db } from "@/db";
import { count, eq, inArray, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { scoutApplications } from "@/db/schema";
import { assignMembershipIdToScout } from "@/services/application.service";
import { hashPassword } from "@/lib/auth/hash";
import { asc } from "drizzle-orm";



import {
  scouts,
  administrators,
  councils,
  users,
  roles,
  registrations,
  payments,
  regions,
  activities,
  activityRegistrations,
  adminUsers,
} from "@/db/schema";

import type {
  DashboardStats,
  AdminScoutRecord,
  AdministratorRecord,
} from "@/types/admin";

export type PendingRegistrationRecord = {
  id: string;
  scoutId: string;
  scoutIdNumber: string | null;

  fullName: string;
  email: string;
  birthdate: Date;
  sex: string;

  address: string | null;
  telephoneNumber: string | null;

  council: string;

  registrationYears: number;
  amount: number; // Estimated total (registrationYears * REGISTRATION_FEE_PER_YEAR) — payments table has no stored amount column
  startDate: string;
  endDate: string;
  status: string;

  isExistingScout: boolean;

  paymentStatus: string | null;
  paymentIntentId: string | null;
  paymentMethod: string | null;

  extraDetails: {
    scoutingPosition?: string;
    advancementRank?: string;
    tenure?: string;
    region?: string;
    sponsoringInstitution?: string;
  };

  createdAt: Date;
};

function mapAdminScoutRecord(scout: {
  id: string;
  userId: string;
  scoutIdNumber: string | null;
  firstName: string;
  lastName: string;
  email: string;
  councilId: string;
  council: string;
  verificationStatus: string;
  createdAt: Date;
  updatedAt: Date;
}): AdminScoutRecord {
  return {
    id: scout.id,
    userId: scout.userId,
    scoutIdNumber: scout.scoutIdNumber,

    fullName: `${scout.lastName}, ${scout.firstName}`,

    email: scout.email,

    councilId: scout.councilId,
    council: scout.council,

    verificationStatus: scout.verificationStatus,

    createdAt: scout.createdAt,
    lastUpdated: scout.updatedAt,
  };
}

function mapAdministratorRecord(admin: {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  roleId: string;
  role: string;
  position: string | null;
  office: string | null;
  createdAt: Date;
  updatedAt: Date;
}): AdministratorRecord {
  return {
    id: admin.id,

    userId: admin.userId,

    fullName: `${admin.lastName}, ${admin.firstName}`,

    email: admin.email,

    roleId: admin.roleId,

    role: admin.role,

    position: admin.position,

    office: admin.office,

    createdAt: admin.createdAt,

    lastUpdated: admin.updatedAt,
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [scoutCount] = await db
    .select({ value: count() })
    .from(scouts);

  const [adminCount] = await db
    .select({ value: count() })
    .from(administrators);

  const [councilCount] = await db
    .select({ value: count() })
    .from(councils);

  return {
    totalScouts: scoutCount.value,
    totalAdministrators: adminCount.value,
    totalCouncils: councilCount.value,

    // Temporary placeholders until your teammate's modules are finished
    pendingPayments: 0,
    activeMembers: 0,
  };
}

export async function getAllScouts(): Promise<AdminScoutRecord[]> {
  const records = await db
    .select({
      id: scouts.id,
      userId: scouts.userId,
      scoutIdNumber: scouts.membershipNumber,

      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,

      councilId: councils.id,
      council: councils.name,

      verificationStatus: scouts.verificationStatus,

      createdAt: scouts.createdAt,
      updatedAt: scouts.updatedAt,
    })
    .from(scouts)
    .innerJoin(users, eq(scouts.userId, users.id))
    .innerJoin(councils, eq(scouts.councilId, councils.id));

  return records.map(mapAdminScoutRecord);
}

export async function getCouncilScouts(
  councilId: string
): Promise<AdminScoutRecord[]> {
  const records = await db
    .select({
      id: scouts.id,
      userId: scouts.userId,
      scoutIdNumber: scouts.membershipNumber,

      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,

      councilId: councils.id,
      council: councils.name,

      verificationStatus: scouts.verificationStatus,

      createdAt: scouts.createdAt,
      updatedAt: scouts.updatedAt,
    })
    .from(scouts)
    .innerJoin(users, eq(scouts.userId, users.id))
    .innerJoin(councils, eq(scouts.councilId, councils.id))
    .where(eq(scouts.councilId, councilId));

  return records.map(mapAdminScoutRecord);
}

export async function getScoutById(
  scoutId: string
): Promise<AdminScoutRecord | null> {
  const [record] = await db
    .select({
      id: scouts.id,
      userId: scouts.userId,
      scoutIdNumber: scouts.membershipNumber,

      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,

      councilId: councils.id,
      council: councils.name,

      verificationStatus: scouts.verificationStatus,

      createdAt: scouts.createdAt,
      updatedAt: scouts.updatedAt,
    })
    .from(scouts)
    .innerJoin(users, eq(scouts.userId, users.id))
    .innerJoin(councils, eq(scouts.councilId, councils.id))
    .where(eq(scouts.id, scoutId));

  if (!record) {
    return null;
  }

  return mapAdminScoutRecord(record);
}

export async function getAdministrators(): Promise<AdministratorRecord[]> {
  const records = await db
    .select({
      id: administrators.id,

      userId: administrators.userId,

      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,

      roleId: roles.id,
      role: roles.name,

      position: administrators.position,
      office: administrators.office,

      createdAt: administrators.createdAt,
      updatedAt: administrators.updatedAt,
    })
    .from(administrators)
    .innerJoin(users, eq(administrators.userId, users.id))
    .innerJoin(roles, eq(administrators.roleId, roles.id));

  return records.map(mapAdministratorRecord);
}

export async function getAdministratorById(
  administratorId: string
): Promise<AdministratorRecord | null> {
  const [record] = await db
    .select({
      id: administrators.id,

      userId: administrators.userId,

      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,

      roleId: roles.id,
      role: roles.name,

      position: administrators.position,
      office: administrators.office,

      createdAt: administrators.createdAt,
      updatedAt: administrators.updatedAt,
    })
    .from(administrators)
    .innerJoin(users, eq(administrators.userId, users.id))
    .innerJoin(roles, eq(administrators.roleId, roles.id))
    .where(eq(administrators.id, administratorId));

  if (!record) {
    return null;
  }

  return mapAdministratorRecord(record);
}

export async function getPendingRegistrations(): Promise<PendingRegistrationRecord[]> {
  const pendingRecords = await db
    .select({
      id: registrations.id,
      scoutId: registrations.scoutId,
      scoutIdNumber: scouts.membershipNumber,
      userId: scouts.userId,

      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      birthdate: users.birthdate,
      sex: users.sex,

      council: councils.name,

      registrationYears: registrations.registrationYears,
      startDate: registrations.startDate,
      endDate: registrations.endDate,
      status: registrations.status,
      remarks: registrations.remarks,
      createdAt: registrations.createdAt,
    })
    .from(registrations)
    .innerJoin(scouts, eq(registrations.scoutId, scouts.id))
    .innerJoin(users, eq(scouts.userId, users.id))
    .innerJoin(councils, eq(scouts.councilId, councils.id))
    .where(eq(registrations.status, "pending"));

  // Determine which scouts already have at least one "active" registration —
  // this pending one is a renewal for them, not a first-time registration.
  const activeRegs = await db
    .select({ scoutId: registrations.scoutId })
    .from(registrations)
    .where(eq(registrations.status, "active"));

  const activeScoutIds = new Set(activeRegs.map((r) => r.scoutId));

  // Fetch scoutApplications separately (not via leftJoin) to avoid
  // duplicate registration rows — same reasoning as the payments fix
  // below. A user can have more than one application (e.g. renewals),
  // so pick the most recent one per user.
  const pendingUserIds = pendingRecords.map((r) => r.userId);

  const relatedApplications = pendingUserIds.length
    ? await db
        .select({
          userId: scoutApplications.userId,
          address: scoutApplications.address,
          telephoneNumber: scoutApplications.telephoneNumber,
          scoutingPosition: scoutApplications.scoutingPosition,
          advancementRank: scoutApplications.advancementRank,
          tenure: scoutApplications.tenure,
          region: scoutApplications.region,
          sponsoringInstitution: scoutApplications.sponsoringInstitution,
          createdAt: scoutApplications.createdAt,
        })
        .from(scoutApplications)
        .where(inArray(scoutApplications.userId, pendingUserIds))
    : [];

  const latestApplicationByUserId = new Map<
    string,
    {
      address: string | null;
      telephoneNumber: string | null;
      scoutingPosition: string | null;
      advancementRank: string | null;
      tenure: number | null;
      region: string | null;
      sponsoringInstitution: string | null;
      createdAt: Date;
    }
  >();

  for (const application of relatedApplications) {
    const current = latestApplicationByUserId.get(application.userId);
    if (!current || application.createdAt > current.createdAt) {
      latestApplicationByUserId.set(application.userId, application);
    }
  }

  // Fetch payments separately (not via leftJoin) to avoid duplicate
  // registration rows when a registration has more than one payment
  // attempt (e.g. a failed GCash try followed by a successful Card retry).
  const pendingRegIds = pendingRecords.map((r) => r.id);

  const relatedPayments = pendingRegIds.length
    ? await db
        .select({
          registrationId: payments.registrationId,
          paymentStatus: payments.paymentStatus,
          paymentIntentId: payments.paymentIntentId,
          paymentMethod: payments.paymentMethod,
          createdAt: payments.createdAt,
        })
        .from(payments)
        .where(inArray(payments.registrationId, pendingRegIds))
    : [];

  // Pick one payment per registration: prefer the most recent "paid" one,
  // falling back to the most recent payment of any status if none paid.
  const bestPaymentByRegId = new Map<
    string,
    { paymentStatus: string; paymentIntentId: string | null; paymentMethod: string | null; createdAt: Date }
  >();

  for (const payment of relatedPayments) {
    const current = bestPaymentByRegId.get(payment.registrationId);

    if (!current) {
      bestPaymentByRegId.set(payment.registrationId, payment);
      continue;
    }

    const currentIsPaid = current.paymentStatus === "paid";
    const candidateIsPaid = payment.paymentStatus === "paid";

    if (candidateIsPaid && !currentIsPaid) {
      // A paid payment always outranks a non-paid one, regardless of date.
      bestPaymentByRegId.set(payment.registrationId, payment);
    } else if (candidateIsPaid === currentIsPaid && payment.createdAt > current.createdAt) {
      // Same "paid-ness" — keep whichever is more recent.
      bestPaymentByRegId.set(payment.registrationId, payment);
    }
  }

  return pendingRecords
    .filter((record) => {
      // Only show registrations that have actually been paid for.
      const bestPayment = bestPaymentByRegId.get(record.id);
      return bestPayment?.paymentStatus === "paid";
    })
    .map((record) => {
      const bestPayment = bestPaymentByRegId.get(record.id);
      const application = latestApplicationByUserId.get(record.userId);

      const extraDetails: PendingRegistrationRecord["extraDetails"] = {
        scoutingPosition: application?.scoutingPosition ?? undefined,
        advancementRank: application?.advancementRank ?? undefined,
        tenure:
          application?.tenure !== null && application?.tenure !== undefined
            ? String(application.tenure)
            : undefined,
        region: application?.region ?? undefined,
        sponsoringInstitution: application?.sponsoringInstitution ?? undefined,
      };

      return {
        id: record.id,
        scoutId: record.scoutId,
        scoutIdNumber: record.scoutIdNumber,

        fullName: `${record.lastName}, ${record.firstName}`,
        email: record.email,
        birthdate: record.birthdate,
        sex: record.sex,

        address: application?.address ?? null,
        telephoneNumber: application?.telephoneNumber ?? null,

        council: record.council,
        registrationYears: record.registrationYears,
        amount: record.registrationYears * REGISTRATION_FEE_PER_YEAR,
        startDate: record.startDate,
        endDate: record.endDate,
        status: record.status,
        isExistingScout: activeScoutIds.has(record.scoutId),

        paymentStatus: bestPayment?.paymentStatus ?? null,
        paymentIntentId: bestPayment?.paymentIntentId ?? null,
        paymentMethod: bestPayment?.paymentMethod ?? null,

        extraDetails,

        createdAt: record.createdAt,
      };
    });
}

export async function approveMembershipReview(
  registrationId: string
) {
  const [registration] = await db
    .select({ id: registrations.id })
    .from(registrations)
    .where(eq(registrations.id, registrationId));

  if (!registration) {
    throw new Error("Registration not found.");
  }

  // Membership stage only: mark reviewed, hand off to Finance.
  // Does NOT activate the registration, promote the user, or
  // issue a membership number — that happens in
  // verifyAndActivateRegistration() once Finance verifies payment.
  await db
    .update(registrations)
    .set({
      status: "membership_approved",
      updatedAt: new Date(),
    })
    .where(eq(registrations.id, registrationId));
}

export async function verifyAndActivateRegistration(
  registrationId: string
) {
  // Find the registration
  const [registration] = await db
    .select({
      scoutId: registrations.scoutId,
    })
    .from(registrations)
    .where(eq(registrations.id, registrationId));

  if (!registration) {
    throw new Error("Registration not found.");
  }

  // Find the scout (including councilId to pass down to assignMembershipIdToScout)
  const [scout] = await db
    .select({
      id: scouts.id,
      userId: scouts.userId,
      councilId: scouts.councilId,
      membershipNumber: scouts.membershipNumber,
    })
    .from(scouts)
    .where(eq(scouts.id, registration.scoutId));

  if (!scout) {
    throw new Error("Scout record not found.");
  }

  // Activate registration
  await db
    .update(registrations)
    .set({
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(registrations.id, registrationId));

  // Promote user
  await db
    .update(users)
    .set({
      role: "SCOUT",
      updatedAt: new Date(),
    })
    .where(eq(users.id, scout.userId));

  // Retain existing membership number OR generate a new structured ID
  const membershipNumber =
    scout.membershipNumber ??
    (await assignMembershipIdToScout(scout.id, scout.councilId));

  await db
    .update(scouts)
    .set({
      status: "ACTIVE",
      verificationStatus: "active",
      membershipNumber,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(scouts.id, scout.id));

  // Mirror the approval onto the scout's latest scoutApplications row.
  const [latestApplication] = await db
    .select({ id: scoutApplications.id })
    .from(scoutApplications)
    .where(eq(scoutApplications.userId, scout.userId))
    .orderBy(desc(scoutApplications.createdAt))
    .limit(1);

  if (latestApplication) {
    await db
      .update(scoutApplications)
      .set({
        status: "APPROVED",
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(scoutApplications.id, latestApplication.id));
  } else {
    // Previously this silently did nothing, leaving scout_applications
    // out of sync with no trace. Log loudly so it's visible instead of
    // hidden — a scout being finance-activated should always have an
    // application row backing it.
    console.error(
      `[verifyAndActivateRegistration] No scoutApplications row found for userId ${scout.userId} (registrationId ${registrationId}). Scout was activated but scout_applications was not updated.`
    );
  }
}

export async function getRegistrationsAwaitingFinance(): Promise<PendingRegistrationRecord[]> {
  const records = await db
    .select({
      id: registrations.id,
      scoutId: registrations.scoutId,
      scoutIdNumber: scouts.membershipNumber,
      userId: scouts.userId,

      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      birthdate: users.birthdate,
      sex: users.sex,

      council: councils.name,

      registrationYears: registrations.registrationYears,
      startDate: registrations.startDate,
      endDate: registrations.endDate,
      status: registrations.status,
      remarks: registrations.remarks,
      createdAt: registrations.createdAt,
    })
    .from(registrations)
    .innerJoin(scouts, eq(registrations.scoutId, scouts.id))
    .innerJoin(users, eq(scouts.userId, users.id))
    .innerJoin(councils, eq(scouts.councilId, councils.id))
    .where(eq(registrations.status, "membership_approved"));

  const activeRegs = await db
    .select({ scoutId: registrations.scoutId })
    .from(registrations)
    .where(eq(registrations.status, "active"));

  const activeScoutIds = new Set(activeRegs.map((r) => r.scoutId));

  const userIds = records.map((r) => r.userId);

  const relatedApplications = userIds.length
    ? await db
        .select({
          userId: scoutApplications.userId,
          address: scoutApplications.address,
          telephoneNumber: scoutApplications.telephoneNumber,
          scoutingPosition: scoutApplications.scoutingPosition,
          advancementRank: scoutApplications.advancementRank,
          tenure: scoutApplications.tenure,
          region: scoutApplications.region,
          sponsoringInstitution: scoutApplications.sponsoringInstitution,
          createdAt: scoutApplications.createdAt,
        })
        .from(scoutApplications)
        .where(inArray(scoutApplications.userId, userIds))
    : [];

  const latestApplicationByUserId = new Map<
    string,
    {
      address: string | null;
      telephoneNumber: string | null;
      scoutingPosition: string;
      advancementRank: string;
      tenure: number;
      region: string;
      sponsoringInstitution: string | null;
      createdAt: Date;
    }
  >();

  for (const application of relatedApplications) {
    const current = latestApplicationByUserId.get(application.userId);
    if (!current || application.createdAt > current.createdAt) {
      latestApplicationByUserId.set(application.userId, application);
    }
  }

  const regIds = records.map((r) => r.id);

  const relatedPayments = regIds.length
    ? await db
        .select({
          registrationId: payments.registrationId,
          paymentStatus: payments.paymentStatus,
          paymentIntentId: payments.paymentIntentId,
          paymentMethod: payments.paymentMethod,
          createdAt: payments.createdAt,
        })
        .from(payments)
        .where(inArray(payments.registrationId, regIds))
    : [];

 const bestPaymentByRegId = new Map<string, { paymentStatus: string; paymentIntentId: string | null; paymentMethod: string | null; createdAt: Date }>();

  for (const payment of relatedPayments) {
    const current = bestPaymentByRegId.get(payment.registrationId);

    if (!current) {
      bestPaymentByRegId.set(payment.registrationId, payment);
      continue;
    }

    const currentIsPaid = current.paymentStatus === "paid";
    const candidateIsPaid = payment.paymentStatus === "paid";

    if (candidateIsPaid && !currentIsPaid) {
      bestPaymentByRegId.set(payment.registrationId, payment);
    } else if (candidateIsPaid === currentIsPaid && payment.createdAt > current.createdAt) {
      bestPaymentByRegId.set(payment.registrationId, payment);
    }
  }

  return records.map((record) => {
    const bestPayment = bestPaymentByRegId.get(record.id);
    const application = latestApplicationByUserId.get(record.userId);

    const extraDetails: PendingRegistrationRecord["extraDetails"] = {
      scoutingPosition: application?.scoutingPosition,
      advancementRank: application?.advancementRank,
      tenure:
        application?.tenure !== undefined
          ? String(application.tenure)
          : undefined,
      region: application?.region,
      sponsoringInstitution: application?.sponsoringInstitution ?? undefined,
    };

    return {
      id: record.id,
      scoutId: record.scoutId,
      scoutIdNumber: record.scoutIdNumber,

      fullName: `${record.lastName}, ${record.firstName}`,
      email: record.email,
      birthdate: record.birthdate,
      sex: record.sex,

      address: application?.address ?? null,
      telephoneNumber: application?.telephoneNumber ?? null,

      council: record.council,
      registrationYears: record.registrationYears,
      amount: record.registrationYears * REGISTRATION_FEE_PER_YEAR,
      startDate: record.startDate,
      endDate: record.endDate,
      status: record.status,

      isExistingScout: activeScoutIds.has(record.scoutId),

      paymentStatus: bestPayment?.paymentStatus ?? null,
      paymentIntentId: bestPayment?.paymentIntentId ?? null,
      paymentMethod: bestPayment?.paymentMethod ?? null,

      extraDetails,

      createdAt: record.createdAt,
    };
  });
}

export async function rejectRegistration(
  registrationId: string,
  feedback: string
) {
  const [existing] = await db
    .select({
      remarks: registrations.remarks,
      scoutId: registrations.scoutId,
    })
    .from(registrations)
    .where(eq(registrations.id, registrationId));

  let remarksData: Record<string, unknown> = {};
  if (existing?.remarks) {
    try {
      remarksData = JSON.parse(existing.remarks);
    } catch {
      remarksData = {};
    }
  }

  remarksData.rejectionFeedback = feedback;

  await db
    .update(registrations)
    .set({
      status: "cancelled",
      remarks: JSON.stringify(remarksData),
      updatedAt: new Date(),
    })
    .where(eq(registrations.id, registrationId));

  // Mirror the rejection onto the scout's latest scoutApplications row
  if (existing?.scoutId) {
    const [scout] = await db
      .select({ userId: scouts.userId })
      .from(scouts)
      .where(eq(scouts.id, existing.scoutId));

    if (scout) {
      const [latestApplication] = await db
        .select({ id: scoutApplications.id })
        .from(scoutApplications)
        .where(eq(scoutApplications.userId, scout.userId))
        .orderBy(desc(scoutApplications.createdAt))
        .limit(1);

      if (latestApplication) {
        await db
          .update(scoutApplications)
          .set({
            status: "REJECTED",
            remarks: feedback,
            reviewedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(scoutApplications.id, latestApplication.id));
      }
    }
  }
}

export async function assignAdministratorRole(
  administratorId: string,
  roleId: string
) {
  throw new Error("Not implemented yet.");
}

export async function removeAdministrator(
  administratorId: string
) {
  throw new Error("Not implemented yet.");
}

// -------------------------------------------------
// Reports
// -------------------------------------------------

const REGISTRATION_FEE_PER_YEAR = 50; // TODO: confirm against register/page.tsx's FEE_PER_YEAR (currently 100 there — mismatch flagged for Reuben)

export async function getRegistrationStatusBreakdown() {
  const rows = await db
    .select({
      status: registrations.status,
      value: count(),
    })
    .from(registrations)
    .groupBy(registrations.status);

  return rows;
}

export async function getPaymentTotals() {
  const statusCounts = await db
    .select({
      status: payments.paymentStatus,
      value: count(),
    })
    .from(payments)
    .groupBy(payments.paymentStatus);

  // Estimated pesos collected: only counts payments with status "paid",
  // joined back to their registration's registrationYears, multiplied by
  // the flat per-year fee. This is an ESTIMATE, not a stored actual
  // amount — payments table has no amount column.
  const paidWithYears = await db
    .select({
      registrationYears: registrations.registrationYears,
    })
    .from(payments)
    .innerJoin(registrations, eq(payments.registrationId, registrations.id))
    .where(eq(payments.paymentStatus, "paid"));

  const estimatedTotalCollected = paidWithYears.reduce(
    (sum, row) => sum + row.registrationYears * REGISTRATION_FEE_PER_YEAR,
    0
  );

  return {
    statusCounts,
    estimatedTotalCollected,
    feePerYearUsed: REGISTRATION_FEE_PER_YEAR,
  };
}

export async function getCouncilRegionBreakdown() {
  const councilCounts = await db
    .select({
      council: councils.name,
      value: count(),
    })
    .from(scouts)
    .innerJoin(councils, eq(scouts.councilId, councils.id))
    .groupBy(councils.name);

  // Left join regions since councils.regionId is nullable — councils
  // without a region assigned yet fall into an "Unassigned" bucket.
  const regionCounts = await db
    .select({
      region: regions.name,
      value: count(),
    })
    .from(scouts)
    .innerJoin(councils, eq(scouts.councilId, councils.id))
    .leftJoin(regions, eq(councils.regionId, regions.id))
    .groupBy(regions.name);

  const normalizedRegionCounts = regionCounts.map((row) => ({
    region: row.region ?? "Unassigned",
    value: row.value,
  }));

  return {
    councilCounts,
    regionCounts: normalizedRegionCounts,
  };
}

export async function getScoutRankBreakdown() {
  const rows = await db
    .select({
      rank: scouts.rank,
      value: count(),
    })
    .from(scouts)
    .groupBy(scouts.rank);

  return rows;
}

export async function getSexBreakdown() {



  const rows = await db
    .select({
      sex: users.sex,
      value: count(),
    })
    .from(scouts)
    .innerJoin(users, eq(scouts.userId, users.id))
    .groupBy(users.sex);

  return rows;
}

export async function getActivityParticipationStats() {
  const rows = await db
    .select({
      activityId: activities.id,
      title: activities.title,
      startDate: activities.startDate,
      value: count(activityRegistrations.id),
    })
    .from(activities)
    .leftJoin(
      activityRegistrations,
      eq(activityRegistrations.activityId, activities.id)
    )
    .groupBy(activities.id, activities.title, activities.startDate)
    .orderBy(desc(activities.startDate));

  return rows;
}


// -------------------------------------------------
// Officers (adminUsers table — the real, live admin accounts
// table used by src/app/admin/api/login/route.ts). Not to be
// confused with the older `administrators`/`roles` tables used
// above in getAdministrators()/getAdministratorById() — those
// are a separate, stale path.
// -------------------------------------------------

export type AdminUserRecord = {
  id: string;
  username: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  active: boolean;
  scope: "COUNCIL" | "REGIONAL" | "NATIONAL";
  council: string | null;
  councilId: string | null;
  region: string | null;
  regionId: string | null;
  lastLoginAt: Date | null;

  passwordExpiration: Date | null;
  accountLockThreshold: number | null;
  incorrectPasswordAttempts: number;
  locked: boolean;

  email: string | null;
  alternateEmail: string | null;
  profilePicture: string | null;

  firstTimeUser: boolean;
  canChangePassword: boolean;
  turnOffEmailNotif: boolean;

  addedBy: string | null;
  addedByName: string | null;
  createdAt: Date;
  deletedAt: Date | null;
};

export async function getAdminUsers(scope?: {
  tier: "COUNCIL" | "REGIONAL" | "NATIONAL" | "SUPER";
  councilId?: string;
  regionId?: string;
}): Promise<AdminUserRecord[]> {
  const addedByUser = alias(adminUsers, "added_by_user");

  let scopeFilter = undefined as ReturnType<typeof eq> | undefined;

  if (scope && scope.tier !== "SUPER") {
    if (scope.tier === "COUNCIL" && scope.councilId) {
      scopeFilter = eq(adminUsers.councilId, scope.councilId);
    } else if (scope.tier === "REGIONAL" && scope.regionId) {
      scopeFilter = eq(adminUsers.regionId, scope.regionId);
    } else if (scope.tier === "NATIONAL") {
      scopeFilter = eq(adminUsers.scope, "NATIONAL");
    }
  }

  const records = await db
    .select({
      id: adminUsers.id,
      username: adminUsers.username,
      fullName: adminUsers.fullName,
      firstName: adminUsers.firstName,
      lastName: adminUsers.lastName,
      role: adminUsers.role,
      active: adminUsers.active,
      scope: adminUsers.scope,
      council: councils.name,
      councilId: adminUsers.councilId,
      region: regions.name,
      regionId: adminUsers.regionId,
      lastLoginAt: adminUsers.lastLoginAt,

      passwordExpiration: adminUsers.passwordExpiration,
      accountLockThreshold: adminUsers.accountLockThreshold,
      incorrectPasswordAttempts: adminUsers.incorrectPasswordAttempts,
      locked: adminUsers.locked,

      email: adminUsers.email,
      alternateEmail: adminUsers.alternateEmail,
      profilePicture: adminUsers.profilePicture,

      firstTimeUser: adminUsers.firstTimeUser,
      canChangePassword: adminUsers.canChangePassword,
      turnOffEmailNotif: adminUsers.turnOffEmailNotif,

      addedBy: adminUsers.addedBy,
      addedByName: addedByUser.fullName,
      createdAt: adminUsers.createdAt,
      deletedAt: adminUsers.deletedAt,
    })
    .from(adminUsers)
    // These MUST be left joins -- a regional/national scope system user
    // has no councilId (and a council-scope one has no regionId), so an
    // inner join here would silently drop them from the list entirely.
    .leftJoin(councils, eq(adminUsers.councilId, councils.id))
    .leftJoin(regions, eq(adminUsers.regionId, regions.id))
    .leftJoin(addedByUser, eq(adminUsers.addedBy, addedByUser.id))
    .where(scopeFilter);

  return records;
}


export async function getAdminUserById(
  id: string
): Promise<AdminUserRecord | null> {
  const addedByUser = alias(adminUsers, "added_by_user_single");

  const [record] = await db
    .select({
      id: adminUsers.id,
      username: adminUsers.username,
      fullName: adminUsers.fullName,
      firstName: adminUsers.firstName,
      lastName: adminUsers.lastName,
      role: adminUsers.role,
      active: adminUsers.active,
      scope: adminUsers.scope,
      council: councils.name,
      councilId: adminUsers.councilId,
      region: regions.name,
      regionId: adminUsers.regionId,
      lastLoginAt: adminUsers.lastLoginAt,

      passwordExpiration: adminUsers.passwordExpiration,
      accountLockThreshold: adminUsers.accountLockThreshold,
      incorrectPasswordAttempts: adminUsers.incorrectPasswordAttempts,
      locked: adminUsers.locked,

      email: adminUsers.email,
      alternateEmail: adminUsers.alternateEmail,
      profilePicture: adminUsers.profilePicture,

      firstTimeUser: adminUsers.firstTimeUser,
      canChangePassword: adminUsers.canChangePassword,
      turnOffEmailNotif: adminUsers.turnOffEmailNotif,

      addedBy: adminUsers.addedBy,
      addedByName: addedByUser.fullName,
      createdAt: adminUsers.createdAt,
      deletedAt: adminUsers.deletedAt,
    })
    .from(adminUsers)
    .leftJoin(councils, eq(adminUsers.councilId, councils.id))
    .leftJoin(regions, eq(adminUsers.regionId, regions.id))
    .leftJoin(addedByUser, eq(adminUsers.addedBy, addedByUser.id))
    .where(eq(adminUsers.id, id));

  return record ?? null;
}

export type CreateAdminUserInput = {
  scope: "COUNCIL" | "REGIONAL" | "NATIONAL";
  councilId: string | null;
  regionId: string | null;
  createdBy: string; // users.id of the person submitting the form
  addedBy: string | null; // adminUsers.id of the acting admin, if applicable

  username: string;
  password: string; // plain text in — hashed before insert
  firstName: string;
  lastName: string;
  role: (typeof adminUsers.role.enumValues)[number];

  email: string | null;
  alternateEmail: string | null;
  passwordExpiration: string | null; // ISO date string, e.g. "2027-01-01"
  accountLockThreshold: number | null;

  firstTimeUser: boolean;
  canChangePassword: boolean;
  turnOffEmailNotif: boolean;
  locked: boolean;
};

export async function createAdminUser(input: CreateAdminUserInput) {
  const passwordHash = await hashPassword(input.password);

  const [created] = await db
    .insert(adminUsers)
    .values({
      scope: input.scope,
      councilId: input.councilId,
      regionId: input.regionId,
      createdBy: input.createdBy,
      addedBy: input.addedBy,

      username: input.username,
      passwordHash,
      fullName: `${input.firstName} ${input.lastName}`,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,

      email: input.email,
      alternateEmail: input.alternateEmail,
      passwordExpiration: input.passwordExpiration
        ? new Date(input.passwordExpiration)
        : null,
      accountLockThreshold: input.accountLockThreshold,

      firstTimeUser: input.firstTimeUser,
      canChangePassword: input.canChangePassword,
      turnOffEmailNotif: input.turnOffEmailNotif,
      locked: input.locked,
    })
    .returning();

  return created;
}

export type UpdateAdminUserInput = Partial<
  Omit<CreateAdminUserInput, "password" | "createdBy">
> & {
  password?: string; // only present if admin is resetting the password
};

export async function updateAdminUser(
  id: string,
  input: UpdateAdminUserInput
) {
  const updateValues: Partial<typeof adminUsers.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (input.username !== undefined) updateValues.username = input.username;
  if (input.firstName !== undefined) updateValues.firstName = input.firstName;
  if (input.lastName !== undefined) updateValues.lastName = input.lastName;
  if (input.firstName !== undefined || input.lastName !== undefined) {
    // Keep fullName in sync if either name part changes.
    const existing = await getAdminUserById(id);
    updateValues.fullName = `${input.firstName ?? existing?.firstName ?? ""} ${
      input.lastName ?? existing?.lastName ?? ""
    }`.trim();
  }
  if (input.role !== undefined) updateValues.role = input.role;
  if (input.email !== undefined) updateValues.email = input.email;
  if (input.alternateEmail !== undefined)
    updateValues.alternateEmail = input.alternateEmail;
  if (input.passwordExpiration !== undefined) {
    updateValues.passwordExpiration = input.passwordExpiration
      ? new Date(input.passwordExpiration)
      : null;
  }
  if (input.accountLockThreshold !== undefined)
    updateValues.accountLockThreshold = input.accountLockThreshold;
  if (input.firstTimeUser !== undefined)
    updateValues.firstTimeUser = input.firstTimeUser;
  if (input.canChangePassword !== undefined)
    updateValues.canChangePassword = input.canChangePassword;
  if (input.turnOffEmailNotif !== undefined)
    updateValues.turnOffEmailNotif = input.turnOffEmailNotif;
  if (input.locked !== undefined) updateValues.locked = input.locked;
  if (input.addedBy !== undefined) updateValues.addedBy = input.addedBy;

  if (input.password) {
    updateValues.passwordHash = await hashPassword(input.password);
  }

  const [updated] = await db
    .update(adminUsers)
    .set(updateValues)
    .where(eq(adminUsers.id, id))
    .returning();

  return updated;
}

// Soft-delete: sets deletedAt + active=false, does NOT remove the row.
// This preserves audit history (addedBy chains, sessions FK, etc.)
export async function deactivateAdminUser(id: string) {
  const [deactivated] = await db
    .update(adminUsers)
    .set({
      active: false,
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(adminUsers.id, id))
    .returning();

  return deactivated;
}


export type CouncilOption = {
  id: string;
  name: string;
};

export async function getCouncilsForDropdown(): Promise<CouncilOption[]> {
  return db
    .select({
      id: councils.id,
      name: councils.name,
    })
    .from(councils)
    .orderBy(asc(councils.name));
}