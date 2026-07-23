// src/services/profile.service.ts

"use server";

import { db } from "@/db";

import {
  users,
} from "@/db/schema/users";

import {
  scoutApplications,
} from "@/db/schema/scoutApplications";

import {
  eq,
} from "drizzle-orm";

export interface UpdateProfileInput {
  userId: string;

  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;

  birthdate: string;
  sex: string;

  avatarUrl?: string;

  bloodType?: string;
  address?: string;
  telephoneNumber?: string;

  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactNumber?: string;
}

export async function updateProfile(
  data: UpdateProfileInput
) {
  try {
    await db
      .update(users)
      .set({
        firstName:
          data.firstName.trim(),

        middleName:
          data.middleName.trim() ||
          null,

        lastName:
          data.lastName.trim(),

        suffix:
          data.suffix.trim() ||
          null,

        birthdate:
          new Date(
            data.birthdate
          ),

        sex:
          data.sex,

        ...(data.avatarUrl
          ? {
              avatarUrl:
                data.avatarUrl,
            }
          : {}),

        updatedAt:
          new Date(),
      })
      .where(
        eq(
          users.id,
          data.userId
        )
      );

    await db
      .update(scoutApplications)
      .set({
        address:
          data.address?.trim() ||
          null,

        telephoneNumber:
          data.telephoneNumber?.trim() ||
          null,

        emergencyContactName:
          data.emergencyContactName?.trim() ||
          null,

        emergencyContactRelationship:
          data.emergencyContactRelationship?.trim() ||
          null,

        emergencyContactNumber:
          data.emergencyContactNumber?.trim() ||
          null,

        updatedAt:
          new Date(),
      })
      .where(
        eq(
          scoutApplications.userId,
          data.userId
        )
      );

    return {
      success: true,
      message:
        "Profile updated successfully.",
    };

  } catch (error) {
    console.error(
      "updateProfile()",
      error
    );

    return {
      success: false,
      message:
        "Unable to update profile.",
    };
  }
}

export async function updateAvatar(
  userId: string,
  avatarUrl: string
) {
  try {
    await db
      .update(users)
      .set({
        avatarUrl,
        updatedAt: new Date(),
      })
      .where(
        eq(
          users.id,
          userId
        )
      );
        
    return {
      success: true,
      avatarUrl,
    };

  } catch (error) {
    console.error(
      "updateAvatar()",
      error
    );

    return {
      success: false,
      avatarUrl: null,
    };
  }
}

export async function getAvatar(
  userId: string
) {
  const [user] = await db
    .select({
      avatarUrl:
        users.avatarUrl,
    })
    .from(users)
    .where(
      eq(
        users.id,
        userId
      )
    );

  return (
    user?.avatarUrl ??
    null
  );
}