//src/app/actions/admin-users.ts

"use server";

import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import {
  adminUsers,
} from "@/db/schema";

import {
  getSessionCookie,
} from "@/lib/auth/cookies";

import {
  getCurrentSession,
} from "@/lib/auth/session";

import {
  hashPassword,
} from "@/lib/auth/hash";

export interface AdminActionResult {
  success: boolean;
  message?: string;
}

export async function createAdminUser(
  formData: FormData
): Promise<AdminActionResult> {
  const sessionId = await getSessionCookie();

  if (!sessionId) {
    return {
      success: false,
      message: "Session expired.",
    };
  }

  const session =
    await getCurrentSession(sessionId);

  if (
    !session ||
    !session.user ||
    !session.adminUser
  ) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  if (
    session.adminUser.role !==
    "CHIEF_EXECUTIVE"
  ) {
    return {
      success: false,
      message:
        "Only the Chief Executive may create officer accounts.",
    };
  }

  const username =
    String(formData.get("username") ?? "").trim();

  const fullName =
    String(formData.get("fullName") ?? "").trim();

  const password =
    String(formData.get("password") ?? "");

  const role =
    String(formData.get("role") ?? "");

  if (
    !username ||
    !fullName ||
    !password ||
    !role
  ) {
    return {
      success: false,
      message: "Missing required fields.",
    };
  }

  const existing =
    await db.query.adminUsers.findFirst({
      where: eq(
        adminUsers.username,
        username
      ),
    });

  if (existing) {
    return {
      success: false,
      message:
        "Username already exists.",
    };
  }

  const passwordHash =
    await hashPassword(password);

  await db.insert(adminUsers).values({
    councilId:
      session.adminUser.councilId,

    createdBy:
      session.user.id,

    username,

    passwordHash,

    fullName,

    role: role as typeof adminUsers.$inferInsert.role,

    active: true,
  });

  return {
    success: true,
    message:
      "Officer account created successfully.",
  };
}

export async function getAdminUsers() {
  const sessionId = await getSessionCookie();

  if (!sessionId) {
    return [];
  }

  const session =
    await getCurrentSession(sessionId);

  if (
    !session ||
    !session.adminUser
  ) {
    return [];
  }

  return db.query.adminUsers.findMany({
    where: eq(
      adminUsers.councilId,
      session.adminUser.councilId
    ),
    orderBy: (
      adminUsers,
      { asc }
    ) => [asc(adminUsers.fullName)],
  });
}

export async function toggleAdminUser(
  id: string
): Promise<AdminActionResult> {
  const sessionId = await getSessionCookie();

  if (!sessionId) {
    return {
      success: false,
      message: "Session expired.",
    };
  }

  const session =
    await getCurrentSession(sessionId);

  if (
    !session ||
    !session.adminUser
  ) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const officer =
    await db.query.adminUsers.findFirst({
      where: and(
        eq(adminUsers.id, id),
        eq(
          adminUsers.councilId,
          session.adminUser.councilId
        )
      ),
    });

  if (!officer) {
    return {
      success: false,
      message: "Officer not found.",
    };
  }

  await db
    .update(adminUsers)
    .set({
      active: !officer.active,
      updatedAt: new Date(),
    })
    .where(eq(adminUsers.id, id));

  return {
    success: true,
    message: officer.active
      ? "Officer disabled."
      : "Officer enabled.",
  };
}

export async function updateAdminUser(
  id: string,
  formData: FormData
): Promise<AdminActionResult> {
  const sessionId = await getSessionCookie();

  if (!sessionId) {
    return {
      success: false,
      message: "Session expired.",
    };
  }

  const session = await getCurrentSession(sessionId);

  if (
    !session ||
    !session.adminUser ||
    session.adminUser.role !== "CHIEF_EXECUTIVE"
  ) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const fullName = String(
    formData.get("fullName") ?? ""
  ).trim();

  const role = String(
    formData.get("role") ?? ""
  );

  const active =
    String(formData.get("active")) === "true";

  await db
    .update(adminUsers)
    .set({
      fullName,
      role: role as typeof adminUsers.$inferInsert.role,
      active,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(adminUsers.id, id),
        eq(
          adminUsers.councilId,
          session.adminUser.councilId
        )
      )
    );

  return {
    success: true,
    message: "Officer updated successfully.",
  };
}

export async function resetAdminPassword(
  id: string,
  newPassword: string
): Promise<AdminActionResult> {
  const sessionId = await getSessionCookie();

  if (!sessionId) {
    return {
      success: false,
      message: "Session expired.",
    };
  }

  const session = await getCurrentSession(sessionId);

  if (
    !session ||
    !session.adminUser ||
    session.adminUser.role !== "CHIEF_EXECUTIVE"
  ) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const passwordHash =
    await hashPassword(newPassword);

  await db
    .update(adminUsers)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(adminUsers.id, id),
        eq(
          adminUsers.councilId,
          session.adminUser.councilId
        )
      )
    );

  return {
    success: true,
    message: "Password reset successfully.",
  };
}

export async function deleteAdminUser(
  id: string
): Promise<AdminActionResult> {
  const sessionId = await getSessionCookie();

  if (!sessionId) {
    return {
      success: false,
      message: "Session expired.",
    };
  }

  const session = await getCurrentSession(sessionId);

  if (
    !session ||
    !session.adminUser ||
    session.adminUser.role !== "CHIEF_EXECUTIVE"
  ) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  await db
    .delete(adminUsers)
    .where(
      and(
        eq(adminUsers.id, id),
        eq(
          adminUsers.councilId,
          session.adminUser.councilId
        )
      )
    );

  return {
    success: true,
    message: "Officer deleted successfully.",
  };
}