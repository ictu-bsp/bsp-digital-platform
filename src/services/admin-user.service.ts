//src/services/admin-user.service.ts

import { eq } from "drizzle-orm";

import { db } from "@/db";

import {
  adminUsers,
} from "@/db/schema";

import {
  hashPassword,
} from "@/lib/auth/hash";

function mapDatabaseError(
  error: unknown
): never {
  console.error(error);

  if (error instanceof Error) {
    const message =
      error.message.toLowerCase();

    if (
      message.includes("failed query") ||
      message.includes("database") ||
      message.includes("connect") ||
      message.includes("connection") ||
      message.includes("timeout")
    ) {
      throw new Error(
        "The database is currently unavailable. Please try again later."
      );
    }
  }

  throw error;
}

export async function getAdminUserById(
  id: string
) {
  try {
    return await db.query.adminUsers.findFirst({
      where: eq(adminUsers.id, id),
    });
  } catch (error) {
    mapDatabaseError(error);
  }
}

export async function getCouncilAdminUsers(
  councilId: string
) {
  try {
    return await db.query.adminUsers.findMany({
      where: eq(
        adminUsers.councilId,
        councilId
      ),
      orderBy: (adminUsers, { asc }) => [
        asc(adminUsers.fullName),
      ],
    });
  } catch (error) {
    mapDatabaseError(error);
  }
}

export async function createAdminUser(
  data: {
    councilId: string;
    createdBy: string;
    fullName: string;
    username: string;
    password: string;
    role:
      | "CHIEF_EXECUTIVE"
      | "MEMBERSHIP_OFFICER"
      | "ACTIVITIES_OFFICER"
      | "FINANCE_OFFICER"
      | "REGISTRAR"
      | "REPORTS_OFFICER";
  }
) {
  try {
    const existing =
      await db.query.adminUsers.findFirst({
        where: eq(
          adminUsers.username,
          data.username
        ),
      });

    if (existing) {
      throw new Error(
        "That username is already in use."
      );
    }

    const passwordHash =
      await hashPassword(data.password);

    const [adminUser] =
      await db
        .insert(adminUsers)
        .values({
          councilId: data.councilId,
          createdBy: data.createdBy,
          fullName: data.fullName,
          username: data.username,
          passwordHash,
          role: data.role,
        })
        .returning();

    return adminUser;
  } catch (error) {
    mapDatabaseError(error);
  }
}

export async function updateAdminUser(
  id: string,
  data: {
    fullName: string;
    username: string;
    role:
      | "CHIEF_EXECUTIVE"
      | "MEMBERSHIP_OFFICER"
      | "ACTIVITIES_OFFICER"
      | "FINANCE_OFFICER"
      | "REGISTRAR"
      | "REPORTS_OFFICER";
  }
) {
  try {
    await db
      .update(adminUsers)
      .set({
        fullName: data.fullName,
        username: data.username,
        role: data.role,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, id));
  } catch (error) {
    mapDatabaseError(error);
  }
}

export async function setAdminUserActive(
  id: string,
  active: boolean
) {
  try {
    await db
      .update(adminUsers)
      .set({
        active,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, id));
  } catch (error) {
    mapDatabaseError(error);
  }
}

export async function resetAdminUserPassword(
  id: string,
  newPassword: string
) {
  try {
    const passwordHash =
      await hashPassword(newPassword);

    await db
      .update(adminUsers)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, id));
  } catch (error) {
    mapDatabaseError(error);
  }
}

export async function deleteAdminUser(
  id: string
) {
  try {
    await db
      .delete(adminUsers)
      .where(eq(adminUsers.id, id));
  } catch (error) {
    mapDatabaseError(error);
  }
}