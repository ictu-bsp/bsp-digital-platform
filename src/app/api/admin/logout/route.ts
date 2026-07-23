// src/app/api/admin/logout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/auth/admin-session";

export async function GET(req: NextRequest) {
  await clearAdminSession();
  return NextResponse.redirect(new URL("/admin/login", req.url));
}