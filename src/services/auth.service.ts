// src/services/auth.service.ts

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { sendVerificationEmail } from "@/lib/email";
import { getSessionCookie, setSessionCookie } from "@/lib/auth/cookies";
import { users, pendingUserRegistrations } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/hash";
import { createSession, deleteExpiredSessions, getSession } from "@/lib/auth/session";

export interface CreatePendingRegistrationInput {
  email: string;
  parentEmail?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string | null;
  birthdate: Date;
  sex: string;
  role: "VISITOR" | "SCOUT";
}

// Maps database connection and runtime errors into user-friendly exceptions
function mapDatabaseError(error: unknown): never {
  console.error(error);
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("failed query") ||
      message.includes("connect") ||
      message.includes("connection") ||
      message.includes("econnrefused") ||
      message.includes("database") ||
      message.includes("timeout")
    ) {
      throw new Error("The database is currently unavailable. Please try again later.");
    }
  }
  throw error;
}

// Authenticates user and initializes user session
export async function loginUser(email: string, password: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const user = await db.query.users.findFirst({
      where: eq(users.email, cleanEmail),
    });

    if (!user) throw new Error("Invalid email or password.");

    const passwordIsValid = await verifyPassword(password, user.passwordHash);
    if (!passwordIsValid) throw new Error("Invalid email or password.");

    await deleteExpiredSessions();

    const existingSessionId = await getSessionCookie();
    let existingAdminUserId: string | undefined = undefined;

    if (existingSessionId) {
      const existingSession = await getSession(existingSessionId);
      if (existingSession?.adminUserId) {
        existingAdminUserId = existingSession.adminUserId;
      }
    }

    const session = await createSession(user.id, existingAdminUserId);
    await setSessionCookie(session.id, session.expiresAt);

    return user;
  } catch (error) {
    mapDatabaseError(error);
  }
}

// Fetches a user record by primary email
export async function findUserByEmail(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const usersFound = await db.select().from(users).where(eq(users.email, cleanEmail)).limit(1);
  return usersFound[0] ?? null;
}

// Fetches a user record by unique identifier
export async function findUserById(id: string) {
  try {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
    });
  } catch (error) {
    mapDatabaseError(error);
  }
}

// Updates stored password hash for an active user
export async function changePassword(userId: string, newPassword: string) {
  try {
    const passwordHash = await hashPassword(newPassword);
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, userId));
  } catch (error) {
    mapDatabaseError(error);
  }
}

// Validates active user password prior to sensitive mutations
export async function verifyCurrentPassword(userId: string, currentPassword: string) {
  try {
    const user = await findUserById(userId);
    if (!user) throw new Error("User not found.");

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) throw new Error("Incorrect password.");

    return true;
  } catch (error) {
    mapDatabaseError(error);
  }
}

// Marks user email address as verified in the users table
export async function verifyUserEmail(userId: string) {
  try {
    await db.update(users).set({ emailVerified: new Date(), updatedAt: new Date() }).where(eq(users.id, userId));
  } catch (error) {
    mapDatabaseError(error);
  }
}

// Generates a 6-digit verification code string
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Sanitizes optional input strings into clean value or null
function cleanOptionalString(val?: string | null): string | null {
  if (!val || typeof val !== "string" || val.trim() === "") return null;
  return val.trim();
}

// Creates or updates a pending registration state and sends verification code
export async function createPendingUserRegistration(data: {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffix?: string | null;
  birthdate: Date;
  sex: string;
  role: "VISITOR" | "SCOUT";
  email: string;
  parentEmail?: string | null;
}) {
  const cleanEmail = data.email.trim().toLowerCase();
  const existingUser = await findUserByEmail(cleanEmail);
  if (existingUser) throw new Error("An account with this email already exists.");

  const existingPending = await db.query.pendingUserRegistrations.findFirst({
    where: eq(pendingUserRegistrations.email, cleanEmail),
  });

  const verificationCode = generateVerificationCode();
  const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

  const sanitizedMiddleName = cleanOptionalString(data.middleName);
  const sanitizedSuffix = cleanOptionalString(data.suffix);
  const sanitizedParentEmail = cleanOptionalString(data.parentEmail)?.toLowerCase() ?? null;

  let registration;

  if (existingPending) {
    [registration] = await db
      .update(pendingUserRegistrations)
      .set({
        firstName: data.firstName,
        middleName: sanitizedMiddleName,
        lastName: data.lastName,
        suffix: sanitizedSuffix,
        parentEmail: sanitizedParentEmail,
        birthdate: data.birthdate,
        sex: data.sex,
        role: data.role,
        verificationCode,
        verificationExpires,
        emailVerifiedAt: null,
      })
      .where(eq(pendingUserRegistrations.id, existingPending.id))
      .returning();
  } else {
    [registration] = await db
      .insert(pendingUserRegistrations)
      .values({
        ...data,
        email: cleanEmail,
        middleName: sanitizedMiddleName,
        suffix: sanitizedSuffix,
        parentEmail: sanitizedParentEmail,
        verificationCode,
        verificationExpires,
      })
      .returning();
  }

  const recipient = sanitizedParentEmail ?? registration.email;
  const isMinorWithoutParent = !sanitizedParentEmail && (new Date().getFullYear() - new Date(data.birthdate).getFullYear() < 18);

  if (!isMinorWithoutParent) {
    const emailResult = await sendVerificationEmail(recipient, verificationCode);
    if (!emailResult.success) {
      console.error("Email delivery failed:", emailResult);
      throw new Error("Failed to send verification email. Please check the email address.");
    }
  }

  return registration;
}

// Validates pending registration code and marks record as email verified
export async function verifyPendingUserRegistration(email: string, code: string) {
  const cleanEmail = email.trim().toLowerCase();
  const registration = await db.query.pendingUserRegistrations.findFirst({
    where: eq(pendingUserRegistrations.email, cleanEmail),
  });

  if (!registration) throw new Error("Registration not found.");

  const expectedRecipient = registration.parentEmail ?? registration.email;
  if (registration.verificationCode !== code) throw new Error("Invalid verification code.");
  if (registration.verificationExpires < new Date()) throw new Error("Verification code has expired.");

  await db
    .update(pendingUserRegistrations)
    .set({ emailVerifiedAt: new Date() })
    .where(eq(pendingUserRegistrations.id, registration.id));

  return {
    verifiedEmail: registration.email,
    sentToEmail: expectedRecipient,
  };
}

// Regenerates verification code and persists optional updated parent email
export async function resendPendingVerification(registrationEmail: string, parentEmail?: string) {
  try {
    const cleanEmail = registrationEmail.trim().toLowerCase();
    const registration = await db.query.pendingUserRegistrations.findFirst({
      where: eq(pendingUserRegistrations.email, cleanEmail),
    });

    if (!registration) throw new Error("Registration not found.");

    const sanitizedParentEmail = cleanOptionalString(parentEmail)?.toLowerCase() ?? null;
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    const [updated] = await db
      .update(pendingUserRegistrations)
      .set({
        verificationCode,
        verificationExpires,
        ...(sanitizedParentEmail ? { parentEmail: sanitizedParentEmail } : {}),
      })
      .where(eq(pendingUserRegistrations.id, registration.id))
      .returning();

    const recipient = sanitizedParentEmail ?? updated.parentEmail ?? updated.email;
    const emailResult = await sendVerificationEmail(recipient, verificationCode);

    if (!emailResult.success) {
      console.error("Resend Email Failure:", emailResult);
      throw new Error("Could not deliver verification email to " + recipient);
    }

    return verificationCode;
  } catch (error) {
    mapDatabaseError(error);
  }
}

// Finalizes user account creation from a verified pending registration
export async function completePendingRegistration(email: string, password: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const registration = await db.query.pendingUserRegistrations.findFirst({
      where: eq(pendingUserRegistrations.email, cleanEmail),
    });

    if (!registration) throw new Error("Registration not found.");

    const existingUser = await findUserByEmail(cleanEmail);
    if (existingUser) throw new Error("An account with this email already exists.");
    if (!registration.emailVerifiedAt) throw new Error("Email has not been verified.");

    const passwordHash = await hashPassword(password);
    const [user] = await db
      .insert(users)
      .values({
        email: registration.email,
        passwordHash,
        firstName: registration.firstName,
        middleName: registration.middleName,
        lastName: registration.lastName,
        suffix: registration.suffix,
        birthdate: registration.birthdate,
        sex: registration.sex,
        role: registration.role,
        emailVerified: registration.emailVerifiedAt,
      })
      .returning();

    await db.delete(pendingUserRegistrations).where(eq(pendingUserRegistrations.id, registration.id));
    return user;
  } catch (error) {
    mapDatabaseError(error);
  }
}