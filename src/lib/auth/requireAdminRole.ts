// src/lib/auth/requireAdminRole.ts
//
// Server-side guard for API routes: resolves the bsp_session cookie into
// an adminUser and checks their role against an allowlist. Use this inside
// Route Handlers (not proxy.ts middleware — DB calls via drizzle-orm need
// the Node runtime, which middleware/edge does not reliably give us).
//
// Usage inside a route.ts:
//   const gate = await requireAdminRole(request, ["FINANCE_OFFICER", "CHIEF_EXECUTIVE"]);
//   if (!gate.ok) return gate.response;
//   const adminUser = gate.adminUser; // safe to use below this line

import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdminUser } from "@/lib/auth/session";
import type { adminRoleEnum } from "@/db/schema/enums";

type AdminRole = (typeof adminRoleEnum.enumValues)[number];

type RequireAdminRoleResult =
  | { ok: true; adminUser: NonNullable<Awaited<ReturnType<typeof getCurrentAdminUser>>> }
  | { ok: false; response: NextResponse };

export async function requireAdminRole(
  request: NextRequest,
  allowedRoles: AdminRole[]
): Promise<RequireAdminRoleResult> {
  const sessionId = request.cookies.get("bsp_session")?.value;

  if (!sessionId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const adminUser = await getCurrentAdminUser(sessionId);

  if (!adminUser) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!adminUser.active || adminUser.locked) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Account inactive or locked" }, { status: 403 }),
    };
  }

  if (!allowedRoles.includes(adminUser.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, adminUser };
}