// src/app/actions/profile.ts

"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/auth/current-user";
import {
  updateProfile,
  type UpdateProfileInput,
} from "@/services/profile.service";

interface ProfileFormData
  extends Omit<UpdateProfileInput, "userId"> {}

export async function updateProfileAction(
  data: ProfileFormData
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return {
      success: false,
      message: "You are not logged in.",
    };
  }

  const result = await updateProfile({
    userId: currentUser.id,
    ...data,
  });

  if (!result.success) {
    return result;
  }

  revalidatePath("/scout/profile");

  return {
    success: true,
    message: "Profile updated successfully.",
  };
}