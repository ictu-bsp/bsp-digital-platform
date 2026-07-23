//src/lib/auth/admin-session.ts

import { cookies } from "next/headers";
import { getSessionCookie } from "./cookies";
import {
  getCurrentAdminUser as getAdminFromSession,
  clearAdminUserFromSession,
} from "./session";

const COOKIE_NAME = "bsp_session";

export async function getCurrentAdminUser() {
  const sessionId = await getSessionCookie();

  if (!sessionId) {
    return null;
  }

  const adminUser = await getAdminFromSession(sessionId);

  if (!adminUser || !adminUser.active) {
    return null;
  }

  return adminUser;
}

export async function clearAdminSession() {
  const sessionId = await getSessionCookie();

  if (sessionId) {
    // Unlink officer from session while keeping the Scout user logged in
    await clearAdminUserFromSession(sessionId);
  } else {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
  }
}