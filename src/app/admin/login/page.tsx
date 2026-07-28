// src/app/admin/login/page.tsx

import { redirect } from "next/navigation";
import { getSessionCookie } from "@/lib/auth/cookies";
import { getCurrentSession } from "@/lib/auth/session";

import AdminLoginForm from "./AdminLoginForm";

export default async function AdminLoginPage() {
  const sessionId = await getSessionCookie();

  if (!sessionId) {
    redirect("/login");
  }

  const session = await getCurrentSession(sessionId);

  if (!session) {
    redirect("/login");
  }

  // Layer 1 Check: Require valid council/regional/national/super admin role
  if (
    session.user.role !== "COUNCIL_ADMIN" &&
    session.user.role !== "REGIONAL_ADMIN" &&
    session.user.role !== "NATIONAL_ADMIN" &&
    session.user.role !== "SUPER_ADMIN"
  ) {
    redirect("/scout");
  }

  // Layer 2 Check: If officer login is already completed, bounce straight to dashboard
  if (session.adminUser) {
    redirect("/admin");
  }

  return <AdminLoginForm />;
}