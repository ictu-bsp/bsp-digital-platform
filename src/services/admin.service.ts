// src/services/admin.service.ts
import { db } from "@/db";
import { count, eq, inArray, desc, asc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { hashPassword } from "@/lib/auth/hash";
import { assignMembershipIdToScout } from "@/services/application.service";
import { scouts, administrators, councils, users, roles, registrations, payments, regions, activities, activityRegistrations, adminUsers, scoutApplications } from "@/db/schema";
import type { DashboardStats, AdminScoutRecord, AdministratorRecord } from "@/types/admin";
const REGISTRATION_FEE_PER_YEAR = 50;
export type PendingRegistrationRecord = { id: string; scoutId: string; scoutIdNumber: string | null; fullName: string; email: string; birthdate: Date; sex: string; address: string | null; telephoneNumber: string | null; council: string; registrationYears: number; amount: number; startDate: string; endDate: string; status: string; isExistingScout: boolean; paymentStatus: string | null; paymentIntentId: string | null; extraDetails: { scoutingPosition?: string; advancementRank?: string; tenure?: string; region?: string; sponsoringInstitution?: string }; createdAt: Date };
export type AdminUserRecord = { id: string; username: string; fullName: string; firstName: string | null; lastName: string | null; role: string; active: boolean; scope: "COUNCIL" | "REGIONAL" | "NATIONAL"; council: string | null; councilId: string | null; region: string | null; regionId: string | null; lastLoginAt: Date | null; passwordExpiration: Date | null; accountLockThreshold: number | null; incorrectPasswordAttempts: number; locked: boolean; email: string | null; alternateEmail: string | null; profilePicture: string | null; firstTimeUser: boolean; canChangePassword: boolean; turnOffEmailNotif: boolean; addedBy: string | null; addedByName: string | null; createdAt: Date; deletedAt: Date | null };
export type CreateAdminUserInput = { scope: "COUNCIL" | "REGIONAL" | "NATIONAL"; councilId: string | null; regionId: string | null; createdBy: string; addedBy: string | null; username: string; password: string; firstName: string; lastName: string; role: (typeof adminUsers.role.enumValues)[number]; email: string | null; alternateEmail: string | null; passwordExpiration: string | null; accountLockThreshold: number | null; firstTimeUser: boolean; canChangePassword: boolean; turnOffEmailNotif: boolean; locked: boolean };
export type UpdateAdminUserInput = Partial<Omit<CreateAdminUserInput, "password" | "createdBy">> & { password?: string };
export type CouncilOption = { id: string; name: string };
// Maps database scout record to AdminScoutRecord format
function mapAdminScoutRecord(scout: { id: string; userId: string; scoutIdNumber: string | null; firstName: string; lastName: string; email: string; councilId: string; council: string; verificationStatus: string; createdAt: Date; updatedAt: Date }): AdminScoutRecord {
  return { id: scout.id, userId: scout.userId, scoutIdNumber: scout.scoutIdNumber, fullName: `${scout.lastName}, ${scout.firstName}`, email: scout.email, councilId: scout.councilId, council: scout.council, verificationStatus: scout.verificationStatus, createdAt: scout.createdAt, lastUpdated: scout.updatedAt };
}
// Maps database administrator record to AdministratorRecord format
function mapAdministratorRecord(admin: { id: string; userId: string; firstName: string; lastName: string; email: string; roleId: string; role: string; position: string | null; office: string | null; createdAt: Date; updatedAt: Date }): AdministratorRecord {
  return { id: admin.id, userId: admin.userId, fullName: `${admin.lastName}, ${admin.firstName}`, email: admin.email, roleId: admin.roleId, role: admin.role, position: admin.position, office: admin.office, createdAt: admin.createdAt, lastUpdated: admin.updatedAt };
}
// Fetches high-level system dashboard counts
export async function getDashboardStats(): Promise<DashboardStats> {
  const [scoutCount] = await db.select({ value: count() }).from(scouts);
  const [adminCount] = await db.select({ value: count() }).from(administrators);
  const [councilCount] = await db.select({ value: count() }).from(councils);
  return { totalScouts: scoutCount.value, totalAdministrators: adminCount.value, totalCouncils: councilCount.value, pendingPayments: 0, activeMembers: 0 };
}
// Retrieves all registered scouts across all councils
export async function getAllScouts(): Promise<AdminScoutRecord[]> {
  const records = await db.select({ id: scouts.id, userId: scouts.userId, scoutIdNumber: scouts.membershipNumber, firstName: users.firstName, lastName: users.lastName, email: users.email, councilId: councils.id, council: councils.name, verificationStatus: scouts.verificationStatus, createdAt: scouts.createdAt, updatedAt: scouts.updatedAt }).from(scouts).innerJoin(users, eq(scouts.userId, users.id)).innerJoin(councils, eq(scouts.councilId, councils.id));
  return records.map(mapAdminScoutRecord);
}
// Fetches all scouts belonging to a specific council ID
export async function getCouncilScouts(councilId: string): Promise<AdminScoutRecord[]> {
  const records = await db.select({ id: scouts.id, userId: scouts.userId, scoutIdNumber: scouts.membershipNumber, firstName: users.firstName, lastName: users.lastName, email: users.email, councilId: councils.id, council: councils.name, verificationStatus: scouts.verificationStatus, createdAt: scouts.createdAt, updatedAt: scouts.updatedAt }).from(scouts).innerJoin(users, eq(scouts.userId, users.id)).innerJoin(councils, eq(scouts.councilId, councils.id)).where(eq(scouts.councilId, councilId));
  return records.map(mapAdminScoutRecord);
}
// Retrieves a single scout by unique identifier
export async function getScoutById(scoutId: string): Promise<AdminScoutRecord | null> {
  const [record] = await db.select({ id: scouts.id, userId: scouts.userId, scoutIdNumber: scouts.membershipNumber, firstName: users.firstName, lastName: users.lastName, email: users.email, councilId: councils.id, council: councils.name, verificationStatus: scouts.verificationStatus, createdAt: scouts.createdAt, updatedAt: scouts.updatedAt }).from(scouts).innerJoin(users, eq(scouts.userId, users.id)).innerJoin(councils, eq(scouts.councilId, councils.id)).where(eq(scouts.id, scoutId));
  if (!record) return null;
  return mapAdminScoutRecord(record);
}
// Retrieves all system administrators
export async function getAdministrators(): Promise<AdministratorRecord[]> {
  const records = await db.select({ id: administrators.id, userId: administrators.userId, firstName: users.firstName, lastName: users.lastName, email: users.email, roleId: roles.id, role: roles.name, position: administrators.position, office: administrators.office, createdAt: administrators.createdAt, updatedAt: administrators.updatedAt }).from(administrators).innerJoin(users, eq(administrators.userId, users.id)).innerJoin(roles, eq(administrators.roleId, roles.id));
  return records.map(mapAdministratorRecord);
}
// Fetches a single administrator by unique identifier
export async function getAdministratorById(administratorId: string): Promise<AdministratorRecord | null> {
  const [record] = await db.select({ id: administrators.id, userId: administrators.userId, firstName: users.firstName, lastName: users.lastName, email: users.email, roleId: roles.id, role: roles.name, position: administrators.position, office: administrators.office, createdAt: administrators.createdAt, updatedAt: administrators.updatedAt }).from(administrators).innerJoin(users, eq(administrators.userId, users.id)).innerJoin(roles, eq(administrators.roleId, roles.id)).where(eq(administrators.id, administratorId));
  if (!record) return null;
  return mapAdministratorRecord(record);
}
// Assigns a role to an administrator
export async function assignAdministratorRole(administratorId: string, roleId: string) {
  throw new Error("Not implemented yet.");
}
// Removes an administrator from the system
export async function removeAdministrator(administratorId: string) {
  throw new Error("Not implemented yet.");
}
// Fetches pending scout applications and registration details
export async function getPendingRegistrations(): Promise<PendingRegistrationRecord[]> {
  const pendingRecords = await db.select({ id: registrations.id, scoutId: registrations.scoutId, scoutIdNumber: scouts.membershipNumber, userId: scouts.userId, firstName: users.firstName, lastName: users.lastName, email: users.email, birthdate: users.birthdate, sex: users.sex, council: councils.name, registrationYears: registrations.registrationYears, startDate: registrations.startDate, endDate: registrations.endDate, status: registrations.status, remarks: registrations.remarks, createdAt: registrations.createdAt }).from(registrations).innerJoin(scouts, eq(registrations.scoutId, scouts.id)).innerJoin(users, eq(scouts.userId, users.id)).innerJoin(councils, eq(scouts.councilId, councils.id)).where(eq(registrations.status, "pending"));
  const activeRegs = await db.select({ scoutId: registrations.scoutId }).from(registrations).where(eq(registrations.status, "active"));
  const activeScoutIds = new Set(activeRegs.map((r) => r.scoutId));
  const pendingUserIds = pendingRecords.map((r) => r.userId);
  const relatedApplications = pendingUserIds.length ? await db.select({ userId: scoutApplications.userId, address: scoutApplications.address, telephoneNumber: scoutApplications.telephoneNumber, scoutingPosition: scoutApplications.scoutingPosition, advancementRank: scoutApplications.advancementRank, tenure: scoutApplications.tenure, region: scoutApplications.region, sponsoringInstitution: scoutApplications.sponsoringInstitution, createdAt: scoutApplications.createdAt }).from(scoutApplications).where(inArray(scoutApplications.userId, pendingUserIds)) : [];
  const latestApplicationByUserId = new Map<string, { address: string | null; telephoneNumber: string | null; scoutingPosition: string | null; advancementRank: string | null; tenure: number | null; region: string | null; sponsoringInstitution: string | null; createdAt: Date }>();
  for (const application of relatedApplications) {
    const current = latestApplicationByUserId.get(application.userId);
    if (!current || application.createdAt > current.createdAt) latestApplicationByUserId.set(application.userId, application);
  }
  const pendingRegIds = pendingRecords.map((r) => r.id);
  const relatedPayments = pendingRegIds.length ? await db.select({ registrationId: payments.registrationId, paymentStatus: payments.paymentStatus, paymentIntentId: payments.paymentIntentId, createdAt: payments.createdAt }).from(payments).where(inArray(payments.registrationId, pendingRegIds)) : [];
  const bestPaymentByRegId = new Map<string, { paymentStatus: string; paymentIntentId: string | null; createdAt: Date }>();
  for (const payment of relatedPayments) {
    const current = bestPaymentByRegId.get(payment.registrationId);
    if (!current) { bestPaymentByRegId.set(payment.registrationId, payment); continue; }
    const currentIsPaid = current.paymentStatus === "paid";
    const candidateIsPaid = payment.paymentStatus === "paid";
    if (candidateIsPaid && !currentIsPaid) bestPaymentByRegId.set(payment.registrationId, payment);
    else if (candidateIsPaid === currentIsPaid && payment.createdAt > current.createdAt) bestPaymentByRegId.set(payment.registrationId, payment);
  }
  return pendingRecords.map((record) => {
    const bestPayment = bestPaymentByRegId.get(record.id);
    const application = latestApplicationByUserId.get(record.userId);
    const extraDetails: PendingRegistrationRecord["extraDetails"] = { scoutingPosition: application?.scoutingPosition ?? undefined, advancementRank: application?.advancementRank ?? undefined, tenure: application?.tenure !== null && application?.tenure !== undefined ? String(application.tenure) : undefined, region: application?.region ?? undefined, sponsoringInstitution: application?.sponsoringInstitution ?? undefined };
    return { id: record.id, scoutId: record.scoutId, scoutIdNumber: record.scoutIdNumber, fullName: `${record.lastName}, ${record.firstName}`, email: record.email, birthdate: record.birthdate, sex: record.sex, address: application?.address ?? null, telephoneNumber: application?.telephoneNumber ?? null, council: record.council, registrationYears: record.registrationYears, amount: record.registrationYears * REGISTRATION_FEE_PER_YEAR, startDate: record.startDate, endDate: record.endDate, status: record.status, isExistingScout: activeScoutIds.has(record.scoutId), paymentStatus: bestPayment?.paymentStatus ?? null, paymentIntentId: bestPayment?.paymentIntentId ?? null, extraDetails, createdAt: record.createdAt };
  });
}
// Approves membership stage for a scout registration
export async function approveMembershipReview(registrationId: string) {
  const [registration] = await db.select({ id: registrations.id }).from(registrations).where(eq(registrations.id, registrationId));
  if (!registration) throw new Error("Registration not found.");
  await db.update(registrations).set({ status: "membership_approved", updatedAt: new Date() }).where(eq(registrations.id, registrationId));
}
// Fully activates registration and updates scout membership status
export async function verifyAndActivateRegistration(registrationId: string) {
  const [registration] = await db.select({ scoutId: registrations.scoutId }).from(registrations).where(eq(registrations.id, registrationId));
  if (!registration) throw new Error("Registration not found.");
  const [scout] = await db.select({ id: scouts.id, userId: scouts.userId, councilId: scouts.councilId, membershipNumber: scouts.membershipNumber }).from(scouts).where(eq(scouts.id, registration.scoutId));
  if (!scout) throw new Error("Scout record not found.");
  await db.update(registrations).set({ status: "active", updatedAt: new Date() }).where(eq(registrations.id, registrationId));
  await db.update(users).set({ role: "SCOUT", updatedAt: new Date() }).where(eq(users.id, scout.userId));
  const membershipNumber = scout.membershipNumber ?? (await assignMembershipIdToScout(scout.id, scout.councilId));
  await db.update(scouts).set({ status: "ACTIVE", verificationStatus: "active", membershipNumber, approvedAt: new Date(), updatedAt: new Date() }).where(eq(scouts.id, scout.id));
  const [latestApplication] = await db.select({ id: scoutApplications.id }).from(scoutApplications).where(eq(scoutApplications.userId, scout.userId)).orderBy(desc(scoutApplications.createdAt)).limit(1);
  if (latestApplication) await db.update(scoutApplications).set({ status: "APPROVED", reviewedAt: new Date(), updatedAt: new Date() }).where(eq(scoutApplications.id, latestApplication.id));
  else console.error(`[verifyAndActivateRegistration] No scoutApplications row found for userId ${scout.userId} (registrationId ${registrationId}). Scout was activated but scout_applications was not updated.`);
}
// Fetches registrations awaiting finance clearance
export async function getRegistrationsAwaitingFinance(): Promise<PendingRegistrationRecord[]> {
  const records = await db.select({ id: registrations.id, scoutId: registrations.scoutId, scoutIdNumber: scouts.membershipNumber, userId: scouts.userId, firstName: users.firstName, lastName: users.lastName, email: users.email, birthdate: users.birthdate, sex: users.sex, council: councils.name, registrationYears: registrations.registrationYears, startDate: registrations.startDate, endDate: registrations.endDate, status: registrations.status, remarks: registrations.remarks, createdAt: registrations.createdAt }).from(registrations).innerJoin(scouts, eq(registrations.scoutId, scouts.id)).innerJoin(users, eq(scouts.userId, users.id)).innerJoin(councils, eq(scouts.councilId, councils.id)).where(eq(registrations.status, "membership_approved"));
  const activeRegs = await db.select({ scoutId: registrations.scoutId }).from(registrations).where(eq(registrations.status, "active"));
  const activeScoutIds = new Set(activeRegs.map((r) => r.scoutId));
  const userIds = records.map((r) => r.userId);
  const relatedApplications = userIds.length ? await db.select({ userId: scoutApplications.userId, address: scoutApplications.address, telephoneNumber: scoutApplications.telephoneNumber, scoutingPosition: scoutApplications.scoutingPosition, advancementRank: scoutApplications.advancementRank, tenure: scoutApplications.tenure, region: scoutApplications.region, sponsoringInstitution: scoutApplications.sponsoringInstitution, createdAt: scoutApplications.createdAt }).from(scoutApplications).where(inArray(scoutApplications.userId, userIds)) : [];
  const latestApplicationByUserId = new Map<string, { address: string | null; telephoneNumber: string | null; scoutingPosition: string; advancementRank: string; tenure: number; region: string; sponsoringInstitution: string | null; createdAt: Date }>();
  for (const application of relatedApplications) {
    const current = latestApplicationByUserId.get(application.userId);
    if (!current || application.createdAt > current.createdAt) latestApplicationByUserId.set(application.userId, application);
  }
  const regIds = records.map((r) => r.id);
  const relatedPayments = regIds.length ? await db.select({ registrationId: payments.registrationId, paymentStatus: payments.paymentStatus, paymentIntentId: payments.paymentIntentId, createdAt: payments.createdAt }).from(payments).where(inArray(payments.registrationId, regIds)) : [];
  const bestPaymentByRegId = new Map<string, { paymentStatus: string; paymentIntentId: string | null; createdAt: Date }>();
  for (const payment of relatedPayments) {
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
    const extraDetails: PendingRegistrationRecord["extraDetails"] = { scoutingPosition: application?.scoutingPosition, advancementRank: application?.advancementRank, tenure: application?.tenure !== undefined ? String(application.tenure) : undefined, region: application?.region, sponsoringInstitution: application?.sponsoringInstitution ?? undefined };
    return { id: record.id, scoutId: record.scoutId, scoutIdNumber: record.scoutIdNumber, fullName: `${record.lastName}, ${record.firstName}`, email: record.email, birthdate: record.birthdate, sex: record.sex, address: application?.address ?? null, telephoneNumber: application?.telephoneNumber ?? null, council: record.council, registrationYears: record.registrationYears, amount: record.registrationYears * REGISTRATION_FEE_PER_YEAR, startDate: record.startDate, endDate: record.endDate, status: record.status, isExistingScout: activeScoutIds.has(record.scoutId), paymentStatus: bestPayment?.paymentStatus ?? null, paymentIntentId: bestPayment?.paymentIntentId ?? null, extraDetails, createdAt: record.createdAt };
  });
}
// Rejects registration record and adds feedback notes
export async function rejectRegistration(registrationId: string, feedback: string) {
  const [existing] = await db.select({ remarks: registrations.remarks, scoutId: registrations.scoutId }).from(registrations).where(eq(registrations.id, registrationId));
  let remarksData: Record<string, unknown> = {};
  if (existing?.remarks) {
    try { remarksData = JSON.parse(existing.remarks); } catch { remarksData = {}; }
  }
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
// Returns distribution of registration statuses
export async function getRegistrationStatusBreakdown() {
  return db.select({ status: registrations.status, value: count() }).from(registrations).groupBy(registrations.status);
}
// Calculates total collected financial payments
export async function getPaymentTotals() {
  const statusCounts = await db.select({ status: payments.paymentStatus, value: count() }).from(payments).groupBy(payments.paymentStatus);
  const paidWithYears = await db.select({ registrationYears: registrations.registrationYears }).from(payments).innerJoin(registrations, eq(payments.registrationId, registrations.id)).where(eq(payments.paymentStatus, "paid"));
  const estimatedTotalCollected = paidWithYears.reduce((sum, row) => sum + row.registrationYears * REGISTRATION_FEE_PER_YEAR, 0);
  return { statusCounts, estimatedTotalCollected, feePerYearUsed: REGISTRATION_FEE_PER_YEAR };
}
// Groups scouts by local councils and geographic regions
export async function getCouncilRegionBreakdown() {
  const councilCounts = await db.select({ council: councils.name, value: count() }).from(scouts).innerJoin(councils, eq(scouts.councilId, councils.id)).groupBy(councils.name);
  const regionCounts = await db.select({ region: regions.name, value: count() }).from(scouts).innerJoin(councils, eq(scouts.councilId, councils.id)).leftJoin(regions, eq(councils.regionId, regions.id)).groupBy(regions.name);
  const normalizedRegionCounts = regionCounts.map((row) => ({ region: row.region ?? "Unassigned", value: row.value }));
  return { councilCounts, regionCounts: normalizedRegionCounts };
}
// Retrieves scout count grouped by rank
export async function getScoutRankBreakdown() {
  return db.select({ rank: scouts.rank, value: count() }).from(scouts).groupBy(scouts.rank);
}
// Groups scouts by sex category
export async function getSexBreakdown() {
  return db.select({ sex: users.sex, value: count() }).from(scouts).innerJoin(users, eq(scouts.userId, users.id)).groupBy(users.sex);
}
// Calculates attendance statistics for activity events
export async function getActivityParticipationStats() {
  return db.select({ activityId: activities.id, title: activities.title, startDate: activities.startDate, value: count(activityRegistrations.id) }).from(activities).leftJoin(activityRegistrations, eq(activityRegistrations.activityId, activities.id)).groupBy(activities.id, activities.title, activities.startDate).orderBy(desc(activities.startDate));
}
// Retrieves admin user accounts based on scope criteria
export async function getAdminUsers(scope?: { tier: "COUNCIL" | "REGIONAL" | "NATIONAL" | "SUPER"; councilId?: string; regionId?: string }): Promise<AdminUserRecord[]> {
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
// Fetches a single admin user profile by ID
export async function getAdminUserById(id: string): Promise<AdminUserRecord | null> {
  const addedByUser = alias(adminUsers, "added_by_user_single");
  const [record] = await db.select({ id: adminUsers.id, username: adminUsers.username, fullName: adminUsers.fullName, firstName: adminUsers.firstName, lastName: adminUsers.lastName, role: adminUsers.role, active: adminUsers.active, scope: adminUsers.scope, council: councils.name, councilId: adminUsers.councilId, region: regions.name, regionId: adminUsers.regionId, lastLoginAt: adminUsers.lastLoginAt, passwordExpiration: adminUsers.passwordExpiration, accountLockThreshold: adminUsers.accountLockThreshold, incorrectPasswordAttempts: adminUsers.incorrectPasswordAttempts, locked: adminUsers.locked, email: adminUsers.email, alternateEmail: adminUsers.alternateEmail, profilePicture: adminUsers.profilePicture, firstTimeUser: adminUsers.firstTimeUser, canChangePassword: adminUsers.canChangePassword, turnOffEmailNotif: adminUsers.turnOffEmailNotif, addedBy: adminUsers.addedBy, addedByName: addedByUser.fullName, createdAt: adminUsers.createdAt, deletedAt: adminUsers.deletedAt }).from(adminUsers).leftJoin(councils, eq(adminUsers.councilId, councils.id)).leftJoin(regions, eq(adminUsers.regionId, regions.id)).leftJoin(addedByUser, eq(adminUsers.addedBy, addedByUser.id)).where(eq(adminUsers.id, id));
  return record ?? null;
}
// Creates and persists a new administrative user
export async function createAdminUser(input: CreateAdminUserInput) {
  const passwordHash = await hashPassword(input.password);
  const [created] = await db.insert(adminUsers).values({ scope: input.scope, councilId: input.councilId, regionId: input.regionId, createdBy: input.createdBy, addedBy: input.addedBy, username: input.username, passwordHash, fullName: `${input.firstName} ${input.lastName}`, firstName: input.firstName, lastName: input.lastName, role: input.role, email: input.email, alternateEmail: input.alternateEmail, passwordExpiration: input.passwordExpiration ? new Date(input.passwordExpiration) : null, accountLockThreshold: input.accountLockThreshold, firstTimeUser: input.firstTimeUser, canChangePassword: input.canChangePassword, turnOffEmailNotif: input.turnOffEmailNotif, locked: input.locked }).returning();
  return created;
}
// Updates an existing administrative user account
export async function updateAdminUser(id: string, input: UpdateAdminUserInput) {
  const updateValues: Partial<typeof adminUsers.$inferInsert> = { updatedAt: new Date() };
  if (input.username !== undefined) updateValues.username = input.username;
  if (input.firstName !== undefined) updateValues.firstName = input.firstName;
  if (input.lastName !== undefined) updateValues.lastName = input.lastName;
  if (input.firstName !== undefined || input.lastName !== undefined) {
    const existing = await getAdminUserById(id);
    updateValues.fullName = `${input.firstName ?? existing?.firstName ?? ""} ${input.lastName ?? existing?.lastName ?? ""}`.trim();
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
// Deactivates an admin user account
export async function deactivateAdminUser(id: string) {
  const [deactivated] = await db.update(adminUsers).set({ active: false, deletedAt: new Date(), updatedAt: new Date() }).where(eq(adminUsers.id, id)).returning();
  return deactivated;
}
// Fetches list of councils formatted for dropdown UI elements
export async function getCouncilsForDropdown(): Promise<CouncilOption[]> {
  return db.select({ id: councils.id, name: councils.name }).from(councils).orderBy(asc(councils.name));
}
// Updates or creates a payment record's status for a registration
export async function updateRegistrationPaymentStatus(registrationId: string, status: string) {
  const [existingPayment] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(eq(payments.registrationId, registrationId))
    .limit(1);

  if (existingPayment) {
    await db
      .update(payments)
      .set({ 
        paymentStatus: status as any, 
        updatedAt: new Date() 
      })
      .where(eq(payments.id, existingPayment.id));
  } else {
    await db.insert(payments).values({
      registrationId,
      paymentStatus: status as any,
      paymentMethod: "manual_verification",
      amount: 0, // Stored as integer
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}