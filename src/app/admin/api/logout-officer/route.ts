//src/app/admin/api/logout-officer/route.ts
import { NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth/cookies";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import { eq } from "drizzle-orm";
// Handles POST request to terminate an officer session by
// clearing adminUserId from the active session record
export async function POST() {
  try {
    const sessionId = await getSessionCookie();
    if (sessionId)
      await db.update(sessions).set({ adminUserId: null }).where(eq(sessions.id, sessionId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to log out officer:", error);
    return NextResponse.json({ success: false, error:
      "Failed to logout officer session." }, { status: 500 });
  }
}