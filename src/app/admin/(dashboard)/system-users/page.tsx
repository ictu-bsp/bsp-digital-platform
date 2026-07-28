import { redirect } from "next/navigation";
import { getAdminUsers } from "@/services/admin.service";
import { getSessionCookie } from "@/lib/auth/cookies";
import { getCurrentSession } from "@/lib/auth/session";
import { resolveAdminScope } from "@/lib/utils/admin-scope";
import Link from "next/link";
import SystemUsersTable from "./components/SystemUsersTable";

export default async function SystemUsersPage() {
  const sessionId = await getSessionCookie();
  if (!sessionId) redirect("/login");

  const session = await getCurrentSession(sessionId);
  if (!session) redirect("/login");

  const scope = resolveAdminScope(session.user);
  if (!scope) redirect("/admin/login");

  // Council/regional/national admins only ever see their own tier's
  // system users here -- SUPER_ADMIN (the true system account) sees
  // everyone, everywhere.
  const users = await getAdminUsers(scope);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-emerald-800">Manage System Users</h1>
          <p className="text-zinc-500 mt-1">
            {scope.tier === "SUPER"
              ? "View all system user accounts across every council and region."
              : "View and manage system user accounts for your own tier."}
          </p>
        </div>

        <Link
          href="/admin/system-users/create"
          className="rounded-lg bg-emerald-800 hover:bg-emerald-900 transition-colors text-white text-sm font-medium py-2.5 px-5"
        >
          + Add System User
        </Link>
      </div>

      <SystemUsersTable users={users} />
    </div>
  );
}
