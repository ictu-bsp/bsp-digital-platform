// src/app/api/admin/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { adminUsers } from "@/db/schema";

import { verifyPassword } from "@/lib/auth/hash";
import { getSessionCookie } from "@/lib/auth/cookies";
import { resolveAdminScope } from "@/lib/utils/admin-scope";

import {
  getCurrentUser,
  attachAdminUserToSession,
} from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required." },
        { status: 400 }
      );
    }

    // 1. Validate Primary Session (Layer 1)
    const sessionId = await getSessionCookie();

    if (!sessionId) {
      return NextResponse.json(
        { message: "Your session has expired. Please log in again." },
        { status: 401 }
      );
    }

    const user = await getCurrentUser(sessionId);

    if (!user) {
      return NextResponse.json(
        { message: "Your session has expired. Please log in again." },
        { status: 401 }
      );
    }

    if (
      user.role !== "COUNCIL_ADMIN" &&
      user.role !== "REGIONAL_ADMIN" &&
      user.role !== "NATIONAL_ADMIN" &&
      user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { message: "You are not authorized to access the Admin Dashboard." },
        { status: 403 }
      );
    }

    const scope = resolveAdminScope(user);

    if (!scope) {
      return NextResponse.json(
        {
          message:
            "Your admin account isn't fully configured (missing council/region assignment). Contact a system administrator.",
        },
        { status: 403 }
      );
    }

    // 2. Find Officer Account (Layer 2) -- scoped to the same tier as the
    // logged-in top-level account. SUPER_ADMIN is the one exception: it's
    // the true system account and can log in as any officer anywhere.
    const scopeFilter =
      scope.tier === "SUPER"
        ? undefined
        : scope.tier === "COUNCIL"
          ? and(
              eq(adminUsers.scope, "COUNCIL"),
              eq(adminUsers.councilId, scope.councilId)
            )
          : scope.tier === "REGIONAL"
            ? and(
                eq(adminUsers.scope, "REGIONAL"),
                eq(adminUsers.regionId, scope.regionId)
              )
            : eq(adminUsers.scope, "NATIONAL");

    const adminUser = await db.query.adminUsers.findFirst({
      where: scopeFilter
        ? and(eq(adminUsers.username, username), scopeFilter)
        : eq(adminUsers.username, username),
    });

    if (!adminUser) {
      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401 }
      );
    }

    if (!adminUser.active) {
      return NextResponse.json(
        { message: "This administrator account has been disabled." },
        { status: 403 }
      );
    }

    // 3. Verify Password
    const passwordMatches = await verifyPassword(
      password,
      adminUser.passwordHash
    );

    if (!passwordMatches) {
      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401 }
      );
    }

    // 4. Attach Officer ID to Active Session First
    await attachAdminUserToSession(sessionId, adminUser.id);

    // 5. Update Officer Timestamp
    await db
      .update(adminUsers)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(adminUsers.id, adminUser.id));

    return NextResponse.json({
      success: true,
      role: adminUser.role,
      fullName: adminUser.fullName,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Unable to log in." },
      { status: 500 }
    );
  }
}