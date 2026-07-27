// src/app/api/admin/logout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionCookie } from "@/lib/auth/cookies";
import { deleteSession } from "@/lib/auth/session";

export async function POST() {
  const sessionId = await getSessionCookie();

  if (sessionId) {
    await deleteSession(sessionId);
  }

  const cookieStore = await cookies();
  cookieStore.delete("bsp_session");

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const sessionId = await getSessionCookie();

  if (sessionId) {
    await deleteSession(sessionId);
  }

  const cookieStore = await cookies();
  cookieStore.delete("bsp_session");

  return NextResponse.redirect(new URL("/login", req.url));
}