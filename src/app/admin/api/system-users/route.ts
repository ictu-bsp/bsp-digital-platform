// src/app/admin/api/system-users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminUser } from "@/services/admin.service";
import { requireAdmin } from "@/lib/auth/require-admin";

// Creates a new administrative system user. Scope (council/region/national)
// is derived from the logged-in top-level admin's own account, NOT taken
// from the request body -- a council admin can only ever create system
// users for their own council. The one exception is SUPER_ADMIN, the true
// unscoped system account, which may explicitly target any tier via the
// request body. Only a Chief Executive (or SUPER_ADMIN) may create system
// users at all -- matches the "System Users" menu item's role list in
// src/lib/auth/admin-menu.ts.
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(["CHIEF_EXECUTIVE"]);
    if (!auth.ok) {
      return NextResponse.json({ message: auth.error }, { status: 403 });
    }

    const { scope } = auth.context;

    const body = await req.json();
    const {
      username, password, firstName, lastName, role,
      email, alternateEmail, passwordExpiration, accountLockThreshold,
      firstTimeUser, canChangePassword, turnOffEmailNotif, locked,
    } = body;

    if (!username || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { message: "Username, password, first name, last name, and role are required." },
        { status: 400 }
      );
    }

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

      if (targetScope === "COUNCIL" && !targetCouncilId) {
        return NextResponse.json(
          { message: "A council is required for a council-scope system user." },
          { status: 400 }
        );
      }
      if (targetScope === "REGIONAL" && !targetRegionId) {
        return NextResponse.json(
          { message: "A region is required for a regional-scope system user." },
          { status: 400 }
        );
      }
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
      createdBy: auth.context.userId,
      addedBy: auth.context.adminUserId,
      username,
      password,
      firstName,
      lastName,
      role,
      email: email || null,
      alternateEmail: alternateEmail || null,
      passwordExpiration: passwordExpiration || null,
      accountLockThreshold:
        accountLockThreshold !== undefined && accountLockThreshold !== null
          ? Number(accountLockThreshold)
          : null,
      firstTimeUser: Boolean(firstTimeUser),
      canChangePassword: Boolean(canChangePassword),
      turnOffEmailNotif: Boolean(turnOffEmailNotif),
      locked: Boolean(locked),
    });

    return NextResponse.json({ success: true, id: created.id });
  } catch (error: unknown) {
    console.error(error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    ) {
      return NextResponse.json({ message: "That username is already taken." }, { status: 409 });
    }
    return NextResponse.json({ message: "Unable to create system user." }, { status: 500 });
  }
}
