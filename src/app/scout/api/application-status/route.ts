// src/app/scout/api/application-status/route.ts
// Lightweight polling endpoint used by the membership pending page to
// detect approval without a full page reload. Returns only the status
// string — no other application data is exposed here.

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getApplicationByUser } from "@/services/application.service";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ status: null }, { status: 401 });
  }

  const application = await getApplicationByUser(user.id);

  return NextResponse.json({ status: application?.status ?? null });
}