//src/app/api/admin/logout-officer/route.ts

import { NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth/cookies";
import { db } from "@/db";
import { sessions } from "@/db/schema"; // Import your session schema table
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    const sessionId = await getSessionCookie();

    if (sessionId) {
      // Clear adminUserId on the active session in Drizzle
      await db
        .update(sessions)
        .set({ adminUserId: null })
        .where(eq(sessions.id, sessionId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to log out officer:", error);
    return NextResponse.json(
      { success: false, error: "Failed to logout officer session." },
      { status: 500 }
    );
  }
}