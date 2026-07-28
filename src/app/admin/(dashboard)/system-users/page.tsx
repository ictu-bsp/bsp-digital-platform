import { getAdminUsers } from "@/services/admin.service";
import Link from "next/link";
import SystemUsersTable from "./components/SystemUsersTable";

export default async function SystemUsersPage() {
  const users = await getAdminUsers();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-emerald-800">Manage System Users</h1>
          <p className="text-zinc-500 mt-1">
            View all system user accounts across councils.
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