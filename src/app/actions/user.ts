// actions/user.ts
"use server";

import { getCurrentUser } from "@/lib/auth/current-user";

export async function getCurrentUserAction() {
  const user = await getCurrentUser();

  console.log("Current User:", user);

  return {
    success: !!user,
    user,
  };
}