// src/services/auth.service.ts

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

import {
  hashPassword,
  verifyPassword,
} from "@/lib/auth/hash";

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  birthdate: Date;
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

export async function createUser(
  data: CreateUserInput
) {
  try {
    const existingUser =
      await db.query.users.findFirst({
        where: eq(users.email, data.email),
      });

    if (existingUser) {
      throw new Error(
        "An account with this email already exists."
      );
    }

    const passwordHash =
      await hashPassword(data.password);

    const [newUser] = await db
      .insert(users)
      .values({
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        suffix: data.suffix,
        birthdate: data.birthdate,
      })
      .returning();

    return newUser;
  } catch (error) {
    mapDatabaseError(error);
  }
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

    return user;
  } catch (error) {
    mapDatabaseError(error);
  }
}

export async function findUserByEmail(
  email: string
) {
  try {
    return await db.query.users.findFirst({
      where: eq(users.email, email),
    });
  } catch (error) {
    mapDatabaseError(error);
  }
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