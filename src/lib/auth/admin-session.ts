//src/lib/auth/admin-session.ts

import { cookies } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { adminUsers } from "@/db/schema/adminUsers";

const COOKIE_NAME = "admin_session";

export async function getCurrentAdminUser() {
  const cookieStore = await cookies();

  const adminSession =
    cookieStore.get(COOKIE_NAME)?.value;

  if (!adminSession) {
    return null;
  }

  const adminUser =
    await db.query.adminUsers.findFirst({
      where: eq(
        adminUsers.id,
        adminSession
      ),
    });

  if (!adminUser) {
    return null;
  }

  if (!adminUser.active) {
    return null;
  }

  return adminUser;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}