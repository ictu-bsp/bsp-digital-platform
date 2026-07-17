//src/services/admin.service.ts

import { db } from "@/db";
import { count, eq, inArray } from "drizzle-orm";
import { desc } from "drizzle-orm";
import { scoutApplications } from "@/db/schema";
import { generateMembershipNumber } from "@/services/application.service";

import {
  scouts,
  administrators,
  councils,
  users,
  roles,
  registrations,
  payments,
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
  gender: string;

  council: string;

  registrationYears: number;
  startDate: string;
  endDate: string;
  status: string;

  isExistingScout: boolean;

  paymentStatus: string | null;
  paymentIntentId: string | null;

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

      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      birthdate: users.birthdate,
      gender: users.gender,

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
          createdAt: payments.createdAt,
        })
        .from(payments)
        .where(inArray(payments.registrationId, pendingRegIds))
    : [];

  // Pick one payment per registration: prefer the most recent "paid" one,
  // falling back to the most recent payment of any status if none paid.
  const bestPaymentByRegId = new Map<string, { paymentStatus: string; paymentIntentId: string | null; createdAt: Date }>();

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
      // A "pending" registration row is created as soon as the user
      // finishes the Register step, before they've picked a payment
      // method or paid anything — so without this filter, admins would
      // see every abandoned/mid-payment attempt as if it were a
      // completed application awaiting review.
      const bestPayment = bestPaymentByRegId.get(record.id);
      return bestPayment?.paymentStatus === "paid";
    })
    .map((record) => {
      let extraDetails: PendingRegistrationRecord["extraDetails"] = {};

      if (record.remarks) {
        try {
          extraDetails = JSON.parse(record.remarks);
        } catch {
          extraDetails = {};
        }
      }

      const bestPayment = bestPaymentByRegId.get(record.id);

      return {
        id: record.id,
        scoutId: record.scoutId,
        scoutIdNumber: record.scoutIdNumber,

        fullName: `${record.lastName}, ${record.firstName}`,
        email: record.email,
        birthdate: record.birthdate,
        gender: record.gender,

        council: record.council,

        registrationYears: record.registrationYears,
        startDate: record.startDate,
        endDate: record.endDate,
        status: record.status,

        isExistingScout: activeScoutIds.has(record.scoutId),

        paymentStatus: bestPayment?.paymentStatus ?? null,
        paymentIntentId: bestPayment?.paymentIntentId ?? null,

        extraDetails,

        createdAt: record.createdAt,
      };
    });
}

export async function approveRegistration(
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

  // Find the scout (need membershipNumber too, for retainment check)
  const [scout] = await db
    .select({
      id: scouts.id,
      userId: scouts.userId,
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

  // Mark the scout verified/active and assign a membership number,
  // retaining any existing one (e.g. renewal approvals shouldn't
  // issue a new number).
  const membershipNumber =
    scout.membershipNumber ?? (await generateMembershipNumber());

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

  // Mirror the approval onto the scout's latest scoutApplications row,
  // if one exists — this is what the membership card / unblur logic
  // on /scout/membership actually reads from.
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
  }
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

  // Mirror the rejection onto the scout's latest scoutApplications row,
  // if one exists, so /scout/membership shows the rejected state
  // instead of staying stuck on "PENDING" indefinitely.
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