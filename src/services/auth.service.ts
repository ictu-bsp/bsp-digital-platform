// src/services/auth.service.ts

import { db } from "@/db";
import { eq } from "drizzle-orm";
import { sendVerificationEmail } from "@/lib/email";
import { setSessionCookie } from "@/lib/auth/cookies";
import { users, pendingUserRegistrations } from "@/db/schema";
import { hashPassword, verifyPassword, } from "@/lib/auth/hash";
import { createSession, deleteExpiredSessions } from "@/lib/auth/session";

export interface CreatePendingRegistrationInput {
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  birthdate: Date;
  gender: string;
}

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
      throw new Error(
        "The database is currently unavailable. Please try again later."
      );
    }
  }

  throw error;
}

export async function loginUser(
  email: string,
  password: string
) {
  try {
    const user =
      await db.query.users.findFirst({
        where: eq(users.email, email),
      });

    if (!user) {
      throw new Error(
        "Invalid email or password."
      );
    }

    const passwordIsValid =
      await verifyPassword(
        password,
        user.passwordHash
      );

    if (!passwordIsValid) {
      throw new Error(
        "Invalid email or password."
      );
    }

    await deleteExpiredSessions(); 

    const session = await createSession(user.id);
      await setSessionCookie(
        session.id,
        session.expiresAt
      );

    return user;
  } catch (error) {
    mapDatabaseError(error);
  }
}

export async function findUserByEmail(email: string) {
  const usersFound = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return usersFound[0] ?? null;
}

export async function findUserById(
  id: string
) {
  try {
    return await db.query.users.findFirst({
      where: eq(users.id, id),
    });
  } catch (error) {
    mapDatabaseError(error);
  }
}

export async function changePassword(
  userId: string,
  newPassword: string
) {
  try {
    const passwordHash =
      await hashPassword(newPassword);

    await db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  } catch (error) {
    mapDatabaseError(error);
  }
}

export async function verifyUserEmail(
  userId: string
) {
  try {
    await db
      .update(users)
      .set({
        emailVerified: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  } catch (error) {
    mapDatabaseError(error);
  }
}

//Creates Random 6-Digit Verification Code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createPendingUserRegistration(data: {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  birthdate: Date;
  gender: string;
  email: string;
}) {
  const existingUser = await findUserByEmail(data.email);

  if (existingUser) {
    throw new Error(
      "An account with this email already exists."
    );
  }

  const existingPending = await db.query.pendingUserRegistrations.findFirst({
    where: eq(
      pendingUserRegistrations.email,
      data.email
    ),
  });

  const verificationCode = generateVerificationCode();

  const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

  if (existingPending) {
    await db
      .update(pendingUserRegistrations)
      .set({
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        suffix: data.suffix,
        birthdate: data.birthdate,
        gender: data.gender,
        verificationCode: verificationCode,
        verificationExpires: verificationExpires,
        emailVerifiedAt: null,
      })
      .where(
        eq(
          pendingUserRegistrations.id,
          existingPending.id
        )
      );
    await sendVerificationEmail(
      data.email,
      verificationCode
    );
    return existingPending;
  }

  const [registration] =
    await db
      .insert(
        pendingUserRegistrations
      )
      .values(
        {
          ...data,
          verificationCode: verificationCode,
          verificationExpires: verificationExpires,
        }
      )
      .returning();

    const emailResult = await sendVerificationEmail(
      data.email,
      verificationCode
    );

    if (!emailResult.success) {
      throw new Error("Failed to send verification email.");
    }

    return registration;
}

export async function verifyPendingUserRegistration(
  email: string,
  code: string
) {
    const registration =
      await db.query.pendingUserRegistrations.findFirst({
        where: eq(
          pendingUserRegistrations.email,
          email
        ),
      });

    if (!registration) {
      throw new Error(
        "Registration not found."
      );
    }

    if (
      registration.verificationCode !== code
    ) {
      throw new Error(
        "Invalid verification code."
      );
    }

    if (
      registration.verificationExpires <
      new Date()
    ) {
      throw new Error(
        "Verification code has expired."
      );
    }

    await db
      .update(pendingUserRegistrations)
      .set({
        emailVerifiedAt: new Date(),
      })
      .where(
        eq(
          pendingUserRegistrations.id,
          registration.id
        )
      );
  return true;
}

export async function resendPendingVerification(
  email: string
) {
  try {
    const registration =
      await db.query.pendingUserRegistrations.findFirst({
        where: eq(
          pendingUserRegistrations.email,
          email
        ),
      });

    if (!registration) {
      throw new Error(
        "Registration not found."
      );
    }

    const verificationCode =
      generateVerificationCode();

    const verificationExpires =
      new Date(
        Date.now() + 10 * 60 * 1000
      );

    await db
      .update(pendingUserRegistrations)
      .set({
        verificationCode,
        verificationExpires,
      })
      .where(
        eq(
          pendingUserRegistrations.id,
          registration.id
        )
      );

    const emailResult = await sendVerificationEmail(
      email,
      verificationCode
    );

    if (!emailResult.success) {
      throw new Error("Failed to resend verification email.");
    }

    return verificationCode;
  }
    catch (error) {
      mapDatabaseError(error);
    }
}

export async function completePendingRegistration(
  email: string,
  password: string
) {
  try {
    const registration =
      await db.query.pendingUserRegistrations.findFirst({
        where: eq(
          pendingUserRegistrations.email,
          email
        ),
      });

    if (!registration) {
      throw new Error(
        "Registration not found."
      );
    }

    const existingUser =
      await findUserByEmail(email);

    if (existingUser) {
      throw new Error(
        "An account with this email already exists."
      );
    }

    if (!registration.emailVerifiedAt) {
      throw new Error(
        "Email has not been verified."
      );
    }

    const passwordHash =
      await hashPassword(password);

    const [user] =
      await db
        .insert(users)
        .values({
          email: registration.email,
          passwordHash,
          firstName: registration.firstName,
          middleName: registration.middleName,
          lastName: registration.lastName,
          suffix: registration.suffix,
          birthdate: registration.birthdate,
          gender: registration.gender,
          emailVerified: registration.emailVerifiedAt,
        })
        .returning();

    await db
      .delete(pendingUserRegistrations)
      .where(
        eq(
          pendingUserRegistrations.id,
          registration.id
        )
      );

    return user;
  } catch (error) {
    mapDatabaseError(error);
  }
}