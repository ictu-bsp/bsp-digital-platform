// src/app/admin/api/system-users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "@/lib/auth/cookies";
import { getCurrentSession } from "@/lib/auth/session";
import { createAdminUser } from "@/services/admin.service";
import { resolveAdminScope } from "@/lib/utils/admin-scope";
// Creates a new administrative system user with role authorization checks.
// Scope (council/region/national) is derived from the logged-in top-level
// admin's own account, NOT taken from the request body -- a council admin
// can only ever create system users for their own council. The one
// exception is SUPER_ADMIN, the true unscoped system account, which may
// explicitly target any council/region/national tier via the request body.
export async function POST(req: NextRequest) {
  try {
    const sessionId = await getSessionCookie();
    if (!sessionId) return NextResponse.json({ message:
      "Your session has expired. Please log in again." }, { status: 401 });
    const session = await getCurrentSession(sessionId);
    if (!session) return NextResponse.json({ message:
      "Your session has expired. Please log in again." }, { status: 401 });
    if (session.user.role !== "COUNCIL_ADMIN" && session.user.role !== "REGIONAL_ADMIN" &&
      session.user.role !== "NATIONAL_ADMIN" && session.user.role !== "SUPER_ADMIN")
      return NextResponse.json({ message:
    "You are not authorized to perform this action." }, { status: 403 });

    const scope = resolveAdminScope(session.user);
    if (!scope) return NextResponse.json({ message:
      "Your admin account isn't fully configured (missing council/region assignment). Contact a system administrator." }, { status: 403 });

    const body = await req.json();
    const { username, password, firstName,
      lastName, role, email, alternateEmail, passwordExpiration,
      accountLockThreshold, firstTimeUser, canChangePassword, turnOffEmailNotif, locked } = body;

    if (!username || !password || !firstName || !lastName || !role)
      return NextResponse.json({ message:
    "Username, password, first name, last name, and role are required." }, { status: 400 });

    // Resolve the actual scope/council/region to save. Non-super admins
    // always inherit their own tier -- the client can't override this.
    // SUPER_ADMIN may target any tier by supplying scope/councilId/regionId
    // explicitly in the body (falls back to NATIONAL if nothing is given).
    let targetScope: "COUNCIL" | "REGIONAL" | "NATIONAL";
    let targetCouncilId: string | null = null;
    let targetRegionId: string | null = null;

    if (scope.tier === "SUPER") {
      targetScope = body.scope ?? "NATIONAL";
      targetCouncilId = targetScope === "COUNCIL" ? body.councilId ?? null : null;
      targetRegionId = targetScope === "REGIONAL" ? body.regionId ?? null : null;

      if (targetScope === "COUNCIL" && !targetCouncilId)
        return NextResponse.json({ message: "A council is required for a council-scope system user." }, { status: 400 });
      if (targetScope === "REGIONAL" && !targetRegionId)
        return NextResponse.json({ message: "A region is required for a regional-scope system user." }, { status: 400 });
    } else if (scope.tier === "COUNCIL") {
      targetScope = "COUNCIL";
      targetCouncilId = scope.councilId;
    } else if (scope.tier === "REGIONAL") {
      targetScope = "REGIONAL";
      targetRegionId = scope.regionId;
    } else {
      targetScope = "NATIONAL";
    }

    const created = await createAdminUser({
      scope: targetScope,
      councilId: targetCouncilId,
      regionId: targetRegionId,
      createdBy: session.user.id, addedBy: session.adminUser?.id ?? null,
      username, password, firstName, lastName, role, email: email || null,
      alternateEmail: alternateEmail || null, passwordExpiration: passwordExpiration || null,
      accountLockThreshold: accountLockThreshold !== undefined && accountLockThreshold !== null ? Number(
        accountLockThreshold) : null, firstTimeUser: Boolean(firstTimeUser), canChangePassword: Boolean(
          canChangePassword), turnOffEmailNotif: Boolean(turnOffEmailNotif), locked: Boolean(locked) });
    return NextResponse.json({ success: true, id: created.id });
  } catch (error: unknown) {
    console.error(error);
    if (typeof error === "object" && error !== null && "code" in error &&
      (error as { code?: string }).code === "23505")
      return NextResponse.json({ message: "That username is already taken." }, { status: 409 });
    return NextResponse.json({ message: "Unable to create system user." }, { status: 500 });
  }
}
