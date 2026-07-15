//src/lib/auth/session.ts

import { randomUUID } from "crypto";
import { eq, lt } from "drizzle-orm";

import { db } from "@/db";
import { sessions, users } from "@/db/schema";

const SESSION_DURATION_DAYS = 7;

export async function createSession(userId: string) {
  const id = randomUUID();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS);

  await db.insert(sessions).values({
    id,
    userId,
    expiresAt,
  });

  return {
    id,
    expiresAt,
  };
}

export async function getSession(sessionId: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId));

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await deleteSession(sessionId);
    return null;
  }

  return session;
}

export async function getCurrentUser(sessionId: string) {
  const session = await getSession(sessionId);

  if (!session) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId));

  console.log("USER FROM DB:", user);

  return user ?? null;
}

export async function deleteSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function deleteExpiredSessions() {
  await db.delete(sessions).where(
    lt(sessions.expiresAt, new Date())
  );
}