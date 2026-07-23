//src/lib/auth/cookies.tc

import { cookies } from "next/headers";

const COOKIE_NAME = "bsp_session";

export async function setSessionCookie(
  sessionId: string,
  expiresAt: Date
) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, sessionId, {
    sameSite: "lax",
  });
}

export async function getSessionCookie() {
  const cookieStore = await cookies();

  return cookieStore.get(COOKIE_NAME)?.value;
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(COOKIE_NAME);
}