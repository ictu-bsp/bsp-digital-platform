// src/app/admin/api/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionCookie } from "@/lib/auth/cookies";
import { deleteSession } from "@/lib/auth/session";
// Handles POST requests to terminate the active session and clear the session cookie
export async function POST() {
  const sessionId = await getSessionCookie();
  if (sessionId) await deleteSession(sessionId);
  const cookieStore = await cookies();
  cookieStore.delete("bsp_session");
  return NextResponse.json({ success: true });
}
// Handles GET requests to terminate the active session, clear the session cookie, and redirect to the login page
export async function GET(req: NextRequest) {
  const sessionId = await getSessionCookie();
  if (sessionId) await deleteSession(sessionId);
  const cookieStore = await cookies();
  cookieStore.delete("bsp_session");
  return NextResponse.redirect(new URL("/login", req.url));
}