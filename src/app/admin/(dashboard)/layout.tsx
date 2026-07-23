// src/app/admin/layout.tsx

import Link from "next/link";
import { redirect } from "next/navigation";

import AdminSidebar from "@/app/admin/(dashboard)/components/AdminSidebar";

import { getSessionCookie } from "@/lib/auth/cookies";
import { getCurrentSession } from "@/lib/auth/session";

import type { AdminRole } from "@/lib/auth/admin-menu";



export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionId = await getSessionCookie();

  if (!sessionId) {
    redirect("/login");
  }

  const session = await getCurrentSession(sessionId);

  if (!session) {
    redirect("/login");
  }

  if (
    session.user.role !== "COUNCIL_ADMIN" &&
    session.user.role !== "SUPER_ADMIN"
  ) {
    redirect("/scout");
  }

  if (!session.adminUser) {
    redirect("/admin/(login)");
  }

  const officerRole = session.adminUser.role;

  return (
    <div className="min-h-screen bg-zinc-100 p-4">
      {/* Top Bar */}
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-full bg-white px-5 py-2 shadow-sm">
          <span className="text-xl font-bold text-green-800">
            eScout
            <span className="ml-1 text-sm font-medium text-zinc-400">
              Admin
            </span>
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-800 text-xs font-bold text-white">
            {session.adminUser.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </span>

          <div>
            <p className="text-sm font-semibold text-zinc-800">
              {session.adminUser.fullName}
            </p>

            <p className="text-xs text-zinc-500">
              {officerRole.replaceAll("_", " ")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Sidebar */}
        <AdminSidebar role={officerRole as AdminRole} />

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}