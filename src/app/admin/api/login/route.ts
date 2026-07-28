// src/app/admin/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { adminUsers } from "@/db/schema";
import { verifyPassword } from "@/lib/auth/hash";
import { getSessionCookie } from "@/lib/auth/cookies";
import { resolveAdminScope } from "@/lib/utils/admin-scope";
import { getCurrentUser, attachAdminUserToSession } from "@/lib/auth/session";
// Handles POST requests to authenticate an admin officer
// account and attach it to the current user session
export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) return NextResponse.json({
       message: "Username and password are required." }, { status: 400 });
    const sessionId = await getSessionCookie();
    if (!sessionId) return NextResponse.json({
       message: "Your session has expired. Please log in again." }, { status: 401 });
    const user = await getCurrentUser(sessionId);
    if (!user) return NextResponse.json({
       message: "Your session has expired. Please log in again." }, { status: 401 });
    if (user.role !== "COUNCIL_ADMIN" && user.role !== "REGIONAL_ADMIN" &&
      user.role !== "NATIONAL_ADMIN" && user.role !== "SUPER_ADMIN")return NextResponse.json({
         message: "You are not authorized to access the Admin Dashboard." }, { status: 403 });
    const scope = resolveAdminScope(user);
    if (!scope) return NextResponse.json({
       message: "Your admin account isn't fully configured (missing council/region assignment). Contact a system administrator." }, { status: 403 });
    const scopeFilter = scope.tier === "SUPER" ? undefined :
     scope.tier === "COUNCIL" ? and(eq(adminUsers.scope, "COUNCIL"),
      eq(adminUsers.councilId, scope.councilId!)) : scope.tier === "REGIONAL" ?
      and(eq(adminUsers.scope, "REGIONAL"), eq(adminUsers.regionId, scope.regionId!)) :
      eq(adminUsers.scope, "NATIONAL");
    const adminUser = await db.query.adminUsers.findFirst({ where: scopeFilter ?
      and(eq(adminUsers.username, username), scopeFilter) :
      eq(adminUsers.username, username) });
    if (!adminUser) return NextResponse.json({ message: "Invalid username or password." }, { status: 401 });
    if (!adminUser.active) return NextResponse.json({ message: "This administrator account has been disabled." }, { status: 403 });
    if (adminUser.locked) return NextResponse.json({ message: "This account has been locked due to too many failed login attempts. Please contact your council administrator." }, { status: 403 });
    if (adminUser.passwordExpiration && new Date(adminUser.passwordExpiration) < new Date()) return NextResponse.json({ message: "Your password has expired. Please contact your council administrator to reset it." }, { status: 403 });
    if (user.role === "COUNCIL_ADMIN" && adminUser.createdBy !== user.id) return NextResponse.json({ message: "This administrator account does not belong to your council." }, { status: 403 });
    const passwordMatches = await verifyPassword(password, adminUser.passwordHash);
    if (!passwordMatches) {
      const newAttemptCount = adminUser.incorrectPasswordAttempts + 1;
      const threshold = adminUser.accountLockThreshold ?? 5;
      const shouldLock = newAttemptCount >= threshold;
      await db.update(adminUsers).set({ incorrectPasswordAttempts: newAttemptCount,
        locked: shouldLock, updatedAt: new Date() }).where(eq(adminUsers.id, adminUser.id));
      return NextResponse.json({ message: shouldLock ? "This account has been locked due to too many failed login attempts. Please contact your council administrator." : "Invalid username or password." }, { status: shouldLock ? 403 : 401 });
    }
    await attachAdminUserToSession(sessionId, adminUser.id);
    await db.update(adminUsers).set({ lastLoginAt: new Date(), incorrectPasswordAttempts: 0,
      updatedAt: new Date() }).where(eq(adminUsers.id, adminUser.id));
    return NextResponse.json({ success: true, role: adminUser.role, fullName: adminUser.fullName });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Unable to log in." }, { status: 500 });
  }
}