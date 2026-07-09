import { db } from "@/db";
import { count, eq } from "drizzle-orm";

import {
  scouts,
  administrators,
  councils,
  users,
  roles,
} from "@/db/schema";

import type {
  DashboardStats,
  AdminScoutRecord,
  AdministratorRecord,
} from "@/types/admin";

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
      scoutIdNumber: scouts.scoutIdNumber,

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
      scoutIdNumber: scouts.scoutIdNumber,

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
      scoutIdNumber: scouts.scoutIdNumber,

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