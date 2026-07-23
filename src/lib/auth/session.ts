// src/lib/auth/session.ts

import { randomUUID } from "crypto";
import { eq, lt } from "drizzle-orm";
import { db } from "@/db";
import {sessions,users,adminUsers,} from "@/db/schema";

const SESSION_DURATION_DAYS = 7;

export async function createSession(
  userId: string,
  adminUserId?: string
) {
  const id = randomUUID();

  const expiresAt = new Date();
  expiresAt.setDate(
    expiresAt.getDate() +
      SESSION_DURATION_DAYS
  );

  await db.insert(sessions).values({
    id,
    userId,
    adminUserId,
    expiresAt,
  });

  return {
    id,
    expiresAt,
  };
}

export async function getSession(
  sessionId: string
) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));

  if (!session) {
    return null;
  }

  if (session.expiresAt < new Date()) {
    await deleteSession(sessionId);
    return null;
  }

  return session;
}

export async function getCurrentUser(
  sessionId: string
) {
  const session =
    await getSession(sessionId);

  if (!session || !session.userId) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId));

  return user ?? null;
}

export async function getCurrentAdminUser(
  sessionId: string
) {
  const session =
    await getSession(sessionId);

  if (
    !session ||
    !session.adminUserId
  ) {
    return null;
  }

  const [adminUser] = await db
    .select()
    .from(adminUsers)
    .where(
      eq(
        adminUsers.id,
        session.adminUserId
      )
    );

  return adminUser ?? null;
}

export async function getCurrentSession(
  sessionId: string
) {
  const session =
    await getSession(sessionId);

  if (!session) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId));

  if (!user) {
    return null;
  }

  let adminUser = null;

  if (session.adminUserId) {
    const [foundAdmin] = await db
      .select()
      .from(adminUsers)
      .where(
        eq(
          adminUsers.id,
          session.adminUserId
        )
      );
    adminUser = foundAdmin ?? null;
  }

  return {
    id: session.id,
    expiresAt: session.expiresAt,
    user,
    adminUser,
  };
}

export async function attachAdminUserToSession(
  sessionId: string,
  adminUserId: string
) {
  await db
    .update(sessions)
    .set({
      adminUserId,
    })
    .where(eq(sessions.id, sessionId));
}

export async function clearAdminUserFromSession(
  sessionId: string
) {
  await db
    .update(sessions)
    .set({
      adminUserId: null,
    })
    .where(eq(sessions.id, sessionId));
}

export async function deleteSession(
  sessionId: string
) {
  await db
    .delete(sessions)
    .where(eq(sessions.id, sessionId));
}

export async function deleteExpiredSessions() {
  await db
    .delete(sessions)
    .where(
      lt(
        sessions.expiresAt,
        new Date()
      )
    );
}