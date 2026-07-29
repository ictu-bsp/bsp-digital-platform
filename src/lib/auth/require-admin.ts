// src/lib/auth/require-admin.ts

import { redirect } from "next/navigation";
import { getSessionCookie } from "./cookies";
import { getCurrentSession } from "./session";
import { resolveAdminScope, type AdminScope } from "@/lib/utils/admin-scope";
import type { AdminRole } from "./admin-menu";

export type AdminAuthContext = {
  userId: string; // top-level users.id (the council/region/national email login)
  adminUserId: string; // adminUsers.id (the officer/system-user username login)
  officerRole: AdminRole;
  scope: AdminScope;
};

type RequireAdminResult =
  | { ok: true; context: AdminAuthContext }
  | { ok: false; error: string };

/**
 * Verifies both layers of an admin session before allowing a write action:
 *  1. The top-level council/regional/national/super account (session.user)
 *     -- resolved into a scope (which council/region this account belongs
 *     to, if any).
 *  2. The specific officer/system-user logged in under that account
 *     (session.adminUser) -- checked against `allowedRoles` so only the
 *     right kind of officer can perform the action (e.g. only an
 *     Activities Officer or Chief Executive can post activities).
 *
 * Both layers have to check out for this to succeed -- a valid council
 * login with no officer selected yet, or an officer with the wrong role,
 * both fail here.
 */
export async function requireAdmin(
  allowedRoles: AdminRole[] | "ALL"
): Promise<RequireAdminResult> {
  const sessionId = await getSessionCookie();
  if (!sessionId) {
    return { ok: false, error: "You must be logged in." };
  }

  const session = await getCurrentSession(sessionId);
  if (!session) {
    return { ok: false, error: "Your session has expired. Please log in again." };
  }

  if (
    session.user.role !== "COUNCIL_ADMIN" &&
    session.user.role !== "REGIONAL_ADMIN" &&
    session.user.role !== "NATIONAL_ADMIN" &&
    session.user.role !== "SUPER_ADMIN"
  ) {
    return { ok: false, error: "You are not authorized to access the admin dashboard." };
  }

  if (!session.adminUser) {
    return { ok: false, error: "Please log in as a system user first." };
  }

  const officerRole = session.adminUser.role as AdminRole;

  if (allowedRoles !== "ALL" && !allowedRoles.includes(officerRole)) {
    return { ok: false, error: "You are not authorized to perform this action." };
  }

  const scope = resolveAdminScope(session.user);
  if (!scope) {
    return {
      ok: false,
      error:
        "Your admin account isn't fully configured (missing council/region assignment). Contact a system administrator.",
    };
  }

  return {
    ok: true,
    context: {
      userId: session.user.id,
      adminUserId: session.adminUser.id,
      officerRole,
      scope,
    },
  };
}

/**
 * Page-server-component variant of requireAdmin: same checks, but redirects
 * instead of returning an error object, since a page has nowhere to render
 * an error to before the guard even runs. Use this at the top of any admin
 * page.tsx that should be restricted to specific officer roles -- the
 * sidebar (admin-menu.ts) already hides the link from other roles, but
 * that's UI only; this closes the gap where someone could still reach the
 * page by typing the URL directly.
 */
export async function requireAdminPage(
  allowedRoles: AdminRole[] | "ALL"
): Promise<AdminAuthContext> {
  const sessionId = await getSessionCookie();
  if (!sessionId) redirect("/login");

  const session = await getCurrentSession(sessionId);
  if (!session) redirect("/login");

  if (
    session.user.role !== "COUNCIL_ADMIN" &&
    session.user.role !== "REGIONAL_ADMIN" &&
    session.user.role !== "NATIONAL_ADMIN" &&
    session.user.role !== "SUPER_ADMIN"
  ) {
    redirect("/scout");
  }

  if (!session.adminUser) redirect("/admin/login");

  const officerRole = session.adminUser.role as AdminRole;

  if (allowedRoles !== "ALL" && !allowedRoles.includes(officerRole)) {
    redirect("/admin");
  }

  const scope = resolveAdminScope(session.user);
  if (!scope) redirect("/admin/login");

  return {
    userId: session.user.id,
    adminUserId: session.adminUser.id,
    officerRole,
    scope,
  };
}
