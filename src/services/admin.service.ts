// src/services/admin.service.ts
import { db } from "@/db";
import { count, eq, inArray, desc, asc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { hashPassword } from "@/lib/auth/hash";
<<<<<<< HEAD
import { assignMembershipIdToScout } from "./application.service";

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
  scoutApplications,
} from "@/db/schema";

import type {
  DashboardStats,
  AdminScoutRecord,
  AdministratorRecord,
} from "@/types/admin";
=======
import { assignMembershipIdToScout } from "@/services/application.service";
import { scouts, administrators, councils, users, roles, registrations, payments, regions, activities, activityRegistrations, adminUsers, scoutApplications } from "@/db/schema";
import type { DashboardStats, AdminScoutRecord, AdministratorRecord } from "@/types/admin";
>>>>>>> 74efdc55341de5125842f4ff292ec287390d5716

const REGISTRATION_FEE_PER_YEAR = 50;

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
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
  isExistingScout: boolean;
  paymentStatus: string | null;
  paymentIntentId: string | null;
<<<<<<< HEAD
  paymentMethod: string | null;
  extraDetails: {
    scoutingPosition?: string;
    advancementRank?: string;
    tenure?: string;
    region?: string;
    sponsoringInstitution?: string;
  };
=======
  extraDetails: { scoutingPosition?: string; advancementRank?: string; scoutSection?: string; tenure?: string; region?: string; sponsoringInstitution?: string; };
>>>>>>> 74efdc55341de5125842f4ff292ec287390d5716
  createdAt: Date;
};

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

export type CreateAdminUserInput = {
  scope: "COUNCIL" | "REGIONAL" | "NATIONAL";
  councilId: string | null;
  regionId: string | null;
  createdBy: string;
  addedBy: string | null;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: (typeof adminUsers.role.enumValues)[number];
  email: string | null;
  alternateEmail: string | null;
  passwordExpiration: string | null;
  accountLockThreshold: number | null;
  firstTimeUser: boolean;
  canChangePassword: boolean;
  turnOffEmailNotif: boolean;
  locked: boolean;
};

export type UpdateAdminUserInput = Partial<Omit<CreateAdminUserInput, "password" | "createdBy">> & { password?: string };

export type CouncilOption = { id: string; name: string };

<<<<<<< HEAD
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

// Fetches high-level system dashboard counts
=======
// Maps raw database scout records into the standardized AdminScoutRecord object interface
function mapAdminScoutRecord(scout: { id: string; userId: string; scoutIdNumber: string | null; firstName: string; lastName: string; email: string; councilId: string; council: string; rank: string; verificationStatus: string; createdAt: Date; updatedAt: Date; }): AdminScoutRecord {
  const { rank, ...scoutData } = scout;
  return { id: scoutData.id, userId: scoutData.userId, scoutIdNumber: scoutData.scoutIdNumber, fullName: `${scoutData.lastName}, ${scoutData.firstName}`, email: scoutData.email, councilId: scoutData.councilId, council: scoutData.council, verificationStatus: scoutData.verificationStatus, createdAt: scoutData.createdAt, lastUpdated: scoutData.updatedAt };
}

// Formats administrator database records into the explicit AdministratorRecord response shape
function mapAdministratorRecord(admin: { id: string; userId: string; firstName: string; lastName: string; email: string; roleId: string; role: string; position: string | null; office: string | null; createdAt: Date; updatedAt: Date; }): AdministratorRecord {
  return { id: admin.id, userId: admin.userId, fullName: `${admin.lastName}, ${admin.firstName}`, email: admin.email, roleId: admin.roleId, role: admin.role, position: admin.position, office: admin.office, createdAt: admin.createdAt, lastUpdated: admin.updatedAt };
}

// Queries database counts to compile aggregate metrics for the primary admin dashboard
>>>>>>> 74efdc55341de5125842f4ff292ec287390d5716
export async function getDashboardStats(): Promise<DashboardStats> {
  const [scoutCount] = await db.select({ value: count() }).from(scouts);
  const [adminCount] = await db.select({ value: count() }).from(administrators);
  const [councilCount] = await db.select({ value: count() }).from(councils);
  const [pendingPaymentCount] = await db.select({ value: count() }).from(payments).where(eq(payments.paymentStatus, "awaiting_payment"));
  const [activeMembersCount] = await db.select({ value: count() }).from(scouts).where(eq(scouts.status, "ACTIVE"));
  return { totalScouts: scoutCount.value, totalAdministrators: adminCount.value, totalCouncils: councilCount.value, pendingPayments: pendingPaymentCount.value, activeMembers: activeMembersCount.value };
}

// Fetches full details for all registered scout accounts joining user and council data
export async function getAllScouts(): Promise<AdminScoutRecord[]> {
  const records = await db.select({ id: scouts.id, userId: scouts.userId, scoutIdNumber: scouts.membershipNumber, firstName: users.firstName, lastName: users.lastName, email: users.email, councilId: councils.id, council: councils.name, rank: scouts.rank, verificationStatus: scouts.verificationStatus, createdAt: scouts.createdAt, updatedAt: scouts.updatedAt }).from(scouts).innerJoin(users, eq(scouts.userId, users.id)).innerJoin(councils, eq(scouts.councilId, councils.id));
  return records.map(mapAdminScoutRecord);
}

// Retrieves all registered scouts filtered by a targeted local council ID
export async function getCouncilScouts(councilId: string): Promise<AdminScoutRecord[]> {
  if (!councilId) return [];
  const records = await db.select({ id: scouts.id, userId: scouts.userId, scoutIdNumber: scouts.membershipNumber, firstName: users.firstName, lastName: users.lastName, email: users.email, councilId: councils.id, council: councils.name, rank: scouts.rank, verificationStatus: scouts.verificationStatus, createdAt: scouts.createdAt, updatedAt: scouts.updatedAt }).from(scouts).innerJoin(users, eq(scouts.userId, users.id)).innerJoin(councils, eq(scouts.councilId, councils.id)).where(eq(scouts.councilId, councilId));
  return records.map(mapAdminScoutRecord);
}

// Looks up a specific scout by unique identifier and maps the returned record
export async function getScoutById(scoutId: string): Promise<AdminScoutRecord | null> {
  if (!scoutId) return null;
  const [record] = await db.select({ id: scouts.id, userId: scouts.userId, scoutIdNumber: scouts.membershipNumber, firstName: users.firstName, lastName: users.lastName, email: users.email, councilId: councils.id, council: councils.name, rank: scouts.rank, verificationStatus: scouts.verificationStatus, createdAt: scouts.createdAt, updatedAt: scouts.updatedAt }).from(scouts).innerJoin(users, eq(scouts.userId, users.id)).innerJoin(councils, eq(scouts.councilId, councils.id)).where(eq(scouts.id, scoutId));
  if (!record) return null;
  return mapAdminScoutRecord(record);
}

// Retrieves all system administrators alongside their assigned user roles
export async function getAdministrators(): Promise<AdministratorRecord[]> {
  const records = await db.select({ id: administrators.id, userId: administrators.userId, firstName: users.firstName, lastName: users.lastName, email: users.email, roleId: roles.id, role: roles.name, position: administrators.position, office: administrators.office, createdAt: administrators.createdAt, updatedAt: administrators.updatedAt }).from(administrators).innerJoin(users, eq(administrators.userId, users.id)).innerJoin(roles, eq(administrators.roleId, roles.id));
  return records.map(mapAdministratorRecord);
}

// Fetches a single system administrator by unique record ID
export async function getAdministratorById(administratorId: string): Promise<AdministratorRecord | null> {
  if (!administratorId) return null;
  const [record] = await db.select({ id: administrators.id, userId: administrators.userId, firstName: users.firstName, lastName: users.lastName, email: users.email, roleId: roles.id, role: roles.name, position: administrators.position, office: administrators.office, createdAt: administrators.createdAt, updatedAt: administrators.updatedAt }).from(administrators).innerJoin(users, eq(administrators.userId, users.id)).innerJoin(roles, eq(administrators.roleId, roles.id)).where(eq(administrators.id, administratorId));
  if (!record) return null;
  return mapAdministratorRecord(record);
}

// Updates an administrator's role foreign key mapping in the database
export async function assignAdministratorRole(administratorId: string, roleId: string) {
  if (!administratorId || !roleId) throw new Error("Missing administratorId or roleId.");
  const [updated] = await db.update(administrators).set({ roleId, updatedAt: new Date() }).where(eq(administrators.id, administratorId)).returning();
  if (!updated) throw new Error("Administrator not found.");
  return updated;
}

// Deletes an administrator record permanently from system records
export async function removeAdministrator(administratorId: string) {
  if (!administratorId) throw new Error("Missing administratorId.");
  const [deleted] = await db.delete(administrators).where(eq(administrators.id, administratorId)).returning();
  if (!deleted) throw new Error("Administrator not found.");
  return deleted;
}

// Compiles pending scout registration applications joining related application data and payments
export async function getPendingRegistrations(): Promise<PendingRegistrationRecord[]> {
  const pendingRecords = await db.select({ id: registrations.id, scoutId: registrations.scoutId, scoutIdNumber: scouts.membershipNumber, userId: scouts.userId, firstName: users.firstName, lastName: users.lastName, email: users.email, birthdate: users.birthdate, sex: users.sex, council: councils.name, registrationYears: registrations.registrationYears, startDate: registrations.startDate, endDate: registrations.endDate, status: registrations.status, remarks: registrations.remarks, createdAt: registrations.createdAt }).from(registrations).innerJoin(scouts, eq(registrations.scoutId, scouts.id)).innerJoin(users, eq(scouts.userId, users.id)).innerJoin(councils, eq(scouts.councilId, councils.id)).where(eq(registrations.status, "pending"));
  if (!pendingRecords.length) return [];
  const activeRegs = await db.select({ scoutId: registrations.scoutId }).from(registrations).where(eq(registrations.status, "active"));
  const activeScoutIds = new Set(activeRegs.map((r) => r.scoutId));
  const pendingUserIds = pendingRecords.map((r) => r.userId).filter(Boolean);
  const relatedApplications = pendingUserIds.length ? await db.select({ id: scoutApplications.id, userId: scoutApplications.userId, address: scoutApplications.address, telephoneNumber: scoutApplications.telephoneNumber, scoutingPosition: scoutApplications.scoutingPosition, advancementRank: scoutApplications.advancementRank, scoutSection: scoutApplications.scoutSection, tenure: scoutApplications.tenure, region: scoutApplications.region, sponsoringInstitution: scoutApplications.sponsoringInstitution, createdAt: scoutApplications.createdAt }).from(scoutApplications).where(inArray(scoutApplications.userId, pendingUserIds)) : [];
  const latestApplicationByUserId = new Map<string, typeof relatedApplications[number]>();
  for (const application of relatedApplications) {
    if (!application.userId) continue;
    const current = latestApplicationByUserId.get(application.userId);
    if (!current || application.createdAt > current.createdAt) latestApplicationByUserId.set(application.userId, application);
  }
<<<<<<< HEAD
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

=======
  const pendingRegIds = pendingRecords.map((r) => r.id).filter(Boolean);
  const relatedPayments = pendingRegIds.length ? await db.select({ id: payments.id, registrationId: payments.registrationId, paymentStatus: payments.paymentStatus, paymentIntentId: payments.paymentIntentId, createdAt: payments.createdAt }).from(payments).where(inArray(payments.registrationId, pendingRegIds)) : [];
  const bestPaymentByRegId = new Map<string, { paymentStatus: string; paymentIntentId: string | null; createdAt: Date }>();
>>>>>>> 74efdc55341de5125842f4ff292ec287390d5716
  for (const payment of relatedPayments) {
    if (!payment.registrationId) continue;
    const current = bestPaymentByRegId.get(payment.registrationId);
    if (!current) { bestPaymentByRegId.set(payment.registrationId, payment); continue; }
    const currentIsPaid = current.paymentStatus === "paid";
    const candidateIsPaid = payment.paymentStatus === "paid";
    if (candidateIsPaid && !currentIsPaid) bestPaymentByRegId.set(payment.registrationId, payment);
    else if (candidateIsPaid === currentIsPaid && payment.createdAt > current.createdAt) bestPaymentByRegId.set(payment.registrationId, payment);
  }
<<<<<<< HEAD

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
=======
  return pendingRecords.map((record) => {
    const bestPayment = bestPaymentByRegId.get(record.id) ?? null;
    const application = latestApplicationByUserId.get(record.userId);
    const extraDetails: PendingRegistrationRecord["extraDetails"] = { scoutingPosition: application?.scoutingPosition ?? undefined, advancementRank: application?.advancementRank ?? undefined, scoutSection: application?.scoutSection || application?.scoutingPosition || undefined, tenure: application?.tenure !== null && application?.tenure !== undefined ? String(application.tenure) : undefined, region: application?.region ?? undefined, sponsoringInstitution: application?.sponsoringInstitution ?? undefined };
    return { id: record.id, scoutId: record.scoutId, scoutIdNumber: record.scoutIdNumber, fullName: `${record.lastName}, ${record.firstName}`, email: record.email, birthdate: record.birthdate, sex: record.sex, address: application?.address ?? null, telephoneNumber: application?.telephoneNumber ?? null, council: record.council, registrationYears: record.registrationYears, amount: record.registrationYears * REGISTRATION_FEE_PER_YEAR, startDate: record.startDate, endDate: record.endDate, status: record.status, isExistingScout: activeScoutIds.has(record.scoutId), paymentStatus: bestPayment?.paymentStatus ?? null, paymentIntentId: bestPayment?.paymentIntentId ?? null, extraDetails, createdAt: record.createdAt };
  });
>>>>>>> 74efdc55341de5125842f4ff292ec287390d5716
}

// Marks a pending registration as approved for membership moving it to the next workflow stage
export async function approveMembershipReview(registrationId: string) {
  if (!registrationId) throw new Error("Missing registrationId.");
  const [registration] = await db.select({ id: registrations.id }).from(registrations).where(eq(registrations.id, registrationId));
  if (!registration) throw new Error("Registration not found.");
  await db.update(registrations).set({ status: "membership_approved", updatedAt: new Date() }).where(eq(registrations.id, registrationId));
}

// Fetches registrations that cleared initial membership review and await finance verification
export async function getRegistrationsAwaitingFinance(): Promise<PendingRegistrationRecord[]> {
  const records = await db.select({ id: registrations.id, scoutId: registrations.scoutId, scoutIdNumber: scouts.membershipNumber, userId: scouts.userId, firstName: users.firstName, lastName: users.lastName, email: users.email, birthdate: users.birthdate, sex: users.sex, council: councils.name, registrationYears: registrations.registrationYears, startDate: registrations.startDate, endDate: registrations.endDate, status: registrations.status, remarks: registrations.remarks, createdAt: registrations.createdAt }).from(registrations).innerJoin(scouts, eq(registrations.scoutId, scouts.id)).innerJoin(users, eq(scouts.userId, users.id)).innerJoin(councils, eq(scouts.councilId, councils.id)).where(eq(registrations.status, "membership_approved"));
  if (!records.length) return [];
  const activeRegs = await db.select({ scoutId: registrations.scoutId }).from(registrations).where(eq(registrations.status, "active"));
  const activeScoutIds = new Set(activeRegs.map((r) => r.scoutId));
  const userIds = records.map((r) => r.userId).filter(Boolean);
  const relatedApplications = userIds.length ? await db.select({ userId: scoutApplications.userId, address: scoutApplications.address, telephoneNumber: scoutApplications.telephoneNumber, scoutingPosition: scoutApplications.scoutingPosition, advancementRank: scoutApplications.advancementRank, scoutSection: scoutApplications.scoutSection, tenure: scoutApplications.tenure, region: scoutApplications.region, sponsoringInstitution: scoutApplications.sponsoringInstitution, createdAt: scoutApplications.createdAt }).from(scoutApplications).where(inArray(scoutApplications.userId, userIds)) : [];
  const latestApplicationByUserId = new Map<string, typeof relatedApplications[number]>();
  for (const application of relatedApplications) {
    if (!application.userId) continue;
    const current = latestApplicationByUserId.get(application.userId);
    if (!current || application.createdAt > current.createdAt) latestApplicationByUserId.set(application.userId, application);
  }
<<<<<<< HEAD
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

=======
  const regIds = records.map((r) => r.id).filter(Boolean);
  const relatedPayments = regIds.length ? await db.select({ registrationId: payments.registrationId, paymentStatus: payments.paymentStatus, paymentIntentId: payments.paymentIntentId, createdAt: payments.createdAt }).from(payments).where(inArray(payments.registrationId, regIds)) : [];
  const bestPaymentByRegId = new Map<string, { paymentStatus: string; paymentIntentId: string | null; createdAt: Date }>();
>>>>>>> 74efdc55341de5125842f4ff292ec287390d5716
  for (const payment of relatedPayments) {
    if (!payment.registrationId) continue;
    const current = bestPaymentByRegId.get(payment.registrationId);
    if (!current) { bestPaymentByRegId.set(payment.registrationId, payment); continue; }
    const currentIsPaid = current.paymentStatus === "paid";
    const candidateIsPaid = payment.paymentStatus === "paid";
    if (candidateIsPaid && !currentIsPaid) bestPaymentByRegId.set(payment.registrationId, payment);
    else if (candidateIsPaid === currentIsPaid && payment.createdAt > current.createdAt) bestPaymentByRegId.set(payment.registrationId, payment);
  }
  return records.map((record) => {
    const bestPayment = bestPaymentByRegId.get(record.id);
    const application = latestApplicationByUserId.get(record.userId);
<<<<<<< HEAD

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
=======
    const extraDetails: PendingRegistrationRecord["extraDetails"] = { scoutingPosition: application?.scoutingPosition ?? undefined, advancementRank: application?.advancementRank ?? undefined, scoutSection: application?.scoutSection || application?.scoutingPosition || undefined, tenure: application?.tenure !== undefined ? String(application.tenure) : undefined, region: application?.region ?? undefined, sponsoringInstitution: application?.sponsoringInstitution ?? undefined };
    return { id: record.id, scoutId: record.scoutId, scoutIdNumber: record.scoutIdNumber, fullName: `${record.lastName}, ${record.firstName}`, email: record.email, birthdate: record.birthdate, sex: record.sex, address: application?.address ?? null, telephoneNumber: application?.telephoneNumber ?? null, council: record.council, registrationYears: record.registrationYears, amount: record.registrationYears * REGISTRATION_FEE_PER_YEAR, startDate: record.startDate, endDate: record.endDate, status: record.status, isExistingScout: activeScoutIds.has(record.scoutId), paymentStatus: bestPayment?.paymentStatus ?? null, paymentIntentId: bestPayment?.paymentIntentId ?? null, extraDetails, createdAt: record.createdAt };
>>>>>>> 74efdc55341de5125842f4ff292ec287390d5716
  });
}

// Cancels registration and updates associated scout application remarks with rejection reason
export async function rejectRegistration(registrationId: string, feedback: string) {
  if (!registrationId) throw new Error("Missing registrationId.");
  const [existing] = await db.select({ remarks: registrations.remarks, scoutId: registrations.scoutId }).from(registrations).where(eq(registrations.id, registrationId));
  let remarksData: Record<string, unknown> = {};
  if (existing?.remarks) { try { remarksData = JSON.parse(existing.remarks); } catch { remarksData = {}; } }
  remarksData.rejectionFeedback = feedback;
  await db.update(registrations).set({ status: "cancelled", remarks: JSON.stringify(remarksData), updatedAt: new Date() }).where(eq(registrations.id, registrationId));
  if (existing?.scoutId) {
    const [scout] = await db.select({ userId: scouts.userId }).from(scouts).where(eq(scouts.id, existing.scoutId));
    if (scout) {
      const [latestApplication] = await db.select({ id: scoutApplications.id }).from(scoutApplications).where(eq(scoutApplications.userId, scout.userId)).orderBy(desc(scoutApplications.createdAt)).limit(1);
      if (latestApplication) await db.update(scoutApplications).set({ status: "REJECTED", remarks: feedback, reviewedAt: new Date(), updatedAt: new Date() }).where(eq(scoutApplications.id, latestApplication.id));
    }
  }
}

// Groups registrations by current status and counts totals for reporting metrics
export async function getRegistrationStatusBreakdown() {
  return db.select({ status: registrations.status, value: count() }).from(registrations).groupBy(registrations.status);
}

// Aggregates payment statistics and calculates total revenue generated from active registrations
export async function getPaymentTotals() {
  const statusCounts = await db.select({ status: payments.paymentStatus, value: count() }).from(payments).groupBy(payments.paymentStatus);
  const paidWithYears = await db.select({ registrationYears: registrations.registrationYears }).from(payments).innerJoin(registrations, eq(payments.registrationId, registrations.id)).where(eq(payments.paymentStatus, "paid"));
  const estimatedTotalCollected = paidWithYears.reduce((sum, row) => sum + row.registrationYears * REGISTRATION_FEE_PER_YEAR, 0);
  return { statusCounts, estimatedTotalCollected, feePerYearUsed: REGISTRATION_FEE_PER_YEAR };
}

// Groups total active scouts by council name and regional territory
export async function getCouncilRegionBreakdown() {
  const councilCounts = await db.select({ council: councils.name, value: count() }).from(scouts).innerJoin(councils, eq(scouts.councilId, councils.id)).groupBy(councils.name);
  const regionCounts = await db.select({ region: regions.name, value: count() }).from(scouts).innerJoin(councils, eq(scouts.councilId, councils.id)).leftJoin(regions, eq(councils.regionId, regions.id)).groupBy(regions.name);
  const normalizedRegionCounts = regionCounts.map((row) => ({ region: row.region ?? "Unassigned", value: row.value }));
  return { councilCounts, regionCounts: normalizedRegionCounts };
}

// Calculates scout count metrics aggregated across different advancement ranks
export async function getScoutRankBreakdown() {
  return db.select({ rank: scouts.rank, value: count() }).from(scouts).groupBy(scouts.rank);
}

// Generates demographic distribution metrics based on user gender classification
export async function getSexBreakdown() {
  return db.select({ sex: users.sex, value: count() }).from(scouts).innerJoin(users, eq(scouts.userId, users.id)).groupBy(users.sex);
}

// Fetches activity event participation counts ordered by start date
export async function getActivityParticipationStats() {
  return db.select({ activityId: activities.id, title: activities.title, startDate: activities.startDate, value: count(activityRegistrations.id) }).from(activities).leftJoin(activityRegistrations, eq(activityRegistrations.activityId, activities.id)).groupBy(activities.id, activities.title, activities.startDate).orderBy(desc(activities.startDate));
}

// Retrieves admin users based on organizational scoping rules and hierarchy levels
export async function getAdminUsers(scope?: { tier: "COUNCIL" | "REGIONAL" | "NATIONAL" | "SUPER"; councilId?: string; regionId?: string; }): Promise<AdminUserRecord[]> {
  const addedByUser = alias(adminUsers, "added_by_user");
  let scopeFilter = undefined as ReturnType<typeof eq> | undefined;
  if (scope && scope.tier !== "SUPER") {
    if (scope.tier === "COUNCIL" && scope.councilId) scopeFilter = eq(adminUsers.councilId, scope.councilId);
    else if (scope.tier === "REGIONAL" && scope.regionId) scopeFilter = eq(adminUsers.regionId, scope.regionId);
    else if (scope.tier === "NATIONAL") scopeFilter = eq(adminUsers.scope, "NATIONAL");
  }
  const records = await db.select({ id: adminUsers.id, username: adminUsers.username, fullName: adminUsers.fullName, firstName: adminUsers.firstName, lastName: adminUsers.lastName, role: adminUsers.role, active: adminUsers.active, scope: adminUsers.scope, council: councils.name, councilId: adminUsers.councilId, region: regions.name, regionId: adminUsers.regionId, lastLoginAt: adminUsers.lastLoginAt, passwordExpiration: adminUsers.passwordExpiration, accountLockThreshold: adminUsers.accountLockThreshold, incorrectPasswordAttempts: adminUsers.incorrectPasswordAttempts, locked: adminUsers.locked, email: adminUsers.email, alternateEmail: adminUsers.alternateEmail, profilePicture: adminUsers.profilePicture, firstTimeUser: adminUsers.firstTimeUser, canChangePassword: adminUsers.canChangePassword, turnOffEmailNotif: adminUsers.turnOffEmailNotif, addedBy: adminUsers.addedBy, addedByName: addedByUser.fullName, createdAt: adminUsers.createdAt, deletedAt: adminUsers.deletedAt }).from(adminUsers).leftJoin(councils, eq(adminUsers.councilId, councils.id)).leftJoin(regions, eq(adminUsers.regionId, regions.id)).leftJoin(addedByUser, eq(adminUsers.addedBy, addedByUser.id)).where(scopeFilter);
  return records;
}

// Retrieves full profile record for an administrative user by unique account ID
export async function getAdminUserById(id: string): Promise<AdminUserRecord | null> {
  if (!id) return null;
  const addedByUser = alias(adminUsers, "added_by_user_single");
  const [record] = await db.select({ id: adminUsers.id, username: adminUsers.username, fullName: adminUsers.fullName, firstName: adminUsers.firstName, lastName: adminUsers.lastName, role: adminUsers.role, active: adminUsers.active, scope: adminUsers.scope, council: councils.name, councilId: adminUsers.councilId, region: regions.name, regionId: adminUsers.regionId, lastLoginAt: adminUsers.lastLoginAt, passwordExpiration: adminUsers.passwordExpiration, accountLockThreshold: adminUsers.accountLockThreshold, incorrectPasswordAttempts: adminUsers.incorrectPasswordAttempts, locked: adminUsers.locked, email: adminUsers.email, alternateEmail: adminUsers.alternateEmail, profilePicture: adminUsers.profilePicture, firstTimeUser: adminUsers.firstTimeUser, canChangePassword: adminUsers.canChangePassword, turnOffEmailNotif: adminUsers.turnOffEmailNotif, addedBy: adminUsers.addedBy, addedByName: addedByUser.fullName, createdAt: adminUsers.createdAt, deletedAt: adminUsers.deletedAt }).from(adminUsers).leftJoin(councils, eq(adminUsers.councilId, councils.id)).leftJoin(regions, eq(adminUsers.regionId, regions.id)).leftJoin(addedByUser, eq(adminUsers.addedBy, addedByUser.id)).where(eq(adminUsers.id, id));
  return record ?? null;
}

// Hashes password credentials and creates a new administrative user record
export async function createAdminUser(input: CreateAdminUserInput) {
  const passwordHash = await hashPassword(input.password);
  const [created] = await db.insert(adminUsers).values({ scope: input.scope, councilId: input.councilId, regionId: input.regionId, createdBy: input.createdBy, addedBy: input.addedBy, username: input.username, passwordHash, fullName: `${input.firstName} ${input.lastName}`, firstName: input.firstName, lastName: input.lastName, role: input.role, email: input.email, alternateEmail: input.alternateEmail, passwordExpiration: input.passwordExpiration ? new Date(input.passwordExpiration) : null, accountLockThreshold: input.accountLockThreshold, firstTimeUser: input.firstTimeUser, canChangePassword: input.canChangePassword, turnOffEmailNotif: input.turnOffEmailNotif, locked: input.locked }).returning();
  return created;
}

// Updates administrative user account attributes and handles safe name fallback logic
export async function updateAdminUser(id: string, input: UpdateAdminUserInput) {
  if (!id) throw new Error("Missing admin user id.");
  const existing = await getAdminUserById(id);
  if (!existing) throw new Error("Admin user not found.");
  const updateValues: Partial<typeof adminUsers.$inferInsert> = { updatedAt: new Date() };
  if (input.username !== undefined) updateValues.username = input.username;
  if (input.firstName !== undefined) updateValues.firstName = input.firstName;
  if (input.lastName !== undefined) updateValues.lastName = input.lastName;
  if (input.firstName !== undefined || input.lastName !== undefined) {
    const updatedFirstName = input.firstName ?? existing.firstName ?? "";
    const updatedLastName = input.lastName ?? existing.lastName ?? "";
    updateValues.fullName = `${updatedFirstName} ${updatedLastName}`.trim();
  }
  if (input.role !== undefined) updateValues.role = input.role;
  if (input.email !== undefined) updateValues.email = input.email;
  if (input.alternateEmail !== undefined) updateValues.alternateEmail = input.alternateEmail;
  if (input.passwordExpiration !== undefined) updateValues.passwordExpiration = input.passwordExpiration ? new Date(input.passwordExpiration) : null;
  if (input.accountLockThreshold !== undefined) updateValues.accountLockThreshold = input.accountLockThreshold;
  if (input.firstTimeUser !== undefined) updateValues.firstTimeUser = input.firstTimeUser;
  if (input.canChangePassword !== undefined) updateValues.canChangePassword = input.canChangePassword;
  if (input.turnOffEmailNotif !== undefined) updateValues.turnOffEmailNotif = input.turnOffEmailNotif;
  if (input.locked !== undefined) updateValues.locked = input.locked;
  if (input.addedBy !== undefined) updateValues.addedBy = input.addedBy;
  if (input.password) updateValues.passwordHash = await hashPassword(input.password);
  const [updated] = await db.update(adminUsers).set(updateValues).where(eq(adminUsers.id, id)).returning();
  return updated;
}

// Soft deactivates an admin account by setting active status to false and attaching deletion timestamp
export async function deactivateAdminUser(id: string) {
  if (!id) throw new Error("Missing admin user id.");
  const [deactivated] = await db.update(adminUsers).set({ active: false, deletedAt: new Date(), updatedAt: new Date() }).where(eq(adminUsers.id, id)).returning();
  return deactivated;
}

// Queries active council options sorted alphabetically for user interface select dropdowns
export async function getCouncilsForDropdown(): Promise<CouncilOption[]> {
  return db.select({ id: councils.id, name: councils.name }).from(councils).orderBy(asc(councils.name));
}

// Updates an existing payment status or inserts a manual verification record if absent
export async function updateRegistrationPaymentStatus(registrationId: string, status: string) {
  if (!registrationId) throw new Error("Missing registrationId.");
  const [existingPayment] = await db.select({ id: payments.id }).from(payments).where(eq(payments.registrationId, registrationId)).limit(1);
  if (existingPayment) {
    await db.update(payments).set({ paymentStatus: status as any, updatedAt: new Date() }).where(eq(payments.id, existingPayment.id));
  } else {
    await db.insert(payments).values({ registrationId, paymentStatus: status as any, paymentMethod: "manual_verification", amount: 0, createdAt: new Date(), updatedAt: new Date() });
  }
}

// Safely map raw application section or rank values to valid database scout rank/type enums
function mapToValidScoutRank(sectionOrRank?: string | null): string {
  if (!sectionOrRank) return "BOY";
  const upper = sectionOrRank.toUpperCase().trim();

  // BSP Section & Alias Detection
  if (upper.includes("KID") || upper.includes("LANGKAY")) return "KID";
  if (upper.includes("KAB") || upper.includes("KAWAN")) return "KAB";
  if (upper.includes("SENIOR") || upper.includes("OUTFIT")) return "SENIOR";
  if (upper.includes("ROVER") || upper.includes("CIRCLE")) return "ROVER";
  if (upper.includes("ADULT") || upper.includes("LEADER") || upper.includes("OFFICER")) return "ADULT";
  if (upper.includes("BOY") || upper.includes("TROOP")) return "BOY";

  return "BOY";
}

// Verifies, generates membership ID if missing, and promotes scout to active status in database
export async function verifyAndActivateRegistration(registrationId: string) {
  if (!registrationId) throw new Error("Missing registrationId.");
  const [registration] = await db.select({ status: registrations.status, scoutId: registrations.scoutId }).from(registrations).where(eq(registrations.id, registrationId));
  if (!registration) throw new Error("Registration not found.");
  if (registration.status === "active") return;
  const [scout] = await db.select({ id: scouts.id, userId: scouts.userId, councilId: scouts.councilId, membershipNumber: scouts.membershipNumber }).from(scouts).where(eq(scouts.id, registration.scoutId));
  if (!scout) throw new Error("Scout record not found.");
  await db.update(registrations).set({ status: "active", updatedAt: new Date() }).where(eq(registrations.id, registrationId));
  await db.update(users).set({ role: "SCOUT", updatedAt: new Date() }).where(eq(users.id, scout.userId));
  const membershipNumber = scout.membershipNumber ?? (await assignMembershipIdToScout(scout.id, scout.councilId));
  const [latestApplication] = await db.select({ id: scoutApplications.id, advancementRank: scoutApplications.advancementRank, scoutSection: scoutApplications.scoutSection, scoutingPosition: scoutApplications.scoutingPosition }).from(scoutApplications).where(eq(scoutApplications.userId, scout.userId)).orderBy(desc(scoutApplications.createdAt)).limit(1);
  const rawSection = latestApplication?.scoutSection || latestApplication?.scoutingPosition || latestApplication?.advancementRank;
  const validRank = mapToValidScoutRank(rawSection);
  await db.update(scouts).set({ status: "ACTIVE", verificationStatus: "active", membershipNumber, rank: validRank as any, approvedAt: new Date(), updatedAt: new Date() }).where(eq(scouts.id, scout.id));
  if (latestApplication) await db.update(scoutApplications).set({ status: "APPROVED", reviewedAt: new Date(), updatedAt: new Date() }).where(eq(scoutApplications.id, latestApplication.id));
}