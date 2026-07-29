// src/app/admin/login/page.tsx
import { redirect } from "next/navigation";
import { getSessionCookie } from "@/lib/auth/cookies";
import { getCurrentSession } from "@/lib/auth/session";
import AdminLoginForm from "./AdminLoginForm";
// Renders the admin login page after verifying user authentication and permission levels
export default async function AdminLoginPage() {
  const sessionId = await getSessionCookie();
  if (!sessionId) redirect("/login");
  const session = await getCurrentSession(sessionId);
  if (!session) redirect("/login");
  if (session.user.role !== "COUNCIL_ADMIN"
    && session.user.role !== "REGIONAL_ADMIN"
    && session.user.role !== "NATIONAL_ADMIN"
    && session.user.role !== "SUPER_ADMIN") redirect("/scout");
  if (session.adminUser) redirect("/admin");
  return <AdminLoginForm />;
}