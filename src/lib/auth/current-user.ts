// src/lib/auth/current-user.ts

import { getSessionCookie } from "./cookies";
import { getCurrentUser as getCurrentUserFromSession } from "./session";

export async function getCurrentUser() {
  const sessionId = await getSessionCookie();

  if (!sessionId) {
    return null;
  }

  return await getCurrentUserFromSession(sessionId);
}