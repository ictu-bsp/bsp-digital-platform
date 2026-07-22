// src/app/admin/layout.tsx

import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  UsersIcon,
  MegaphoneIcon,
  ShieldCheckIcon,
  ChartBarSquareIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

import { getSessionCookie } from "@/lib/auth/cookies";
import { getCurrentSession } from "@/lib/auth/session";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: Squares2X2Icon,
    roles: [
      "CHIEF_EXECUTIVE",
      "MEMBERSHIP_OFFICER",
      "ACTIVITIES_OFFICER",
      "FINANCE_OFFICER",
      "REGISTRAR",
      "REPORTS_OFFICER",
    ],
  },
  {
    label: "Membership Review",
    href: "/admin/membership-review",
    icon: ClipboardDocumentListIcon,
    roles: [
      "CHIEF_EXECUTIVE",
      "MEMBERSHIP_OFFICER",
    ],
  },
  {
    label: "Scout Roster",
    href: "/admin/scout-roster",
    icon: UsersIcon,
    roles: [
      "CHIEF_EXECUTIVE",
      "MEMBERSHIP_OFFICER",
      "REGISTRAR",
    ],
  },
  {
    label: "Announcement Hub",
    href: "/admin/announcement-hub",
    icon: MegaphoneIcon,
    roles: [
      "CHIEF_EXECUTIVE",
      "ACTIVITIES_OFFICER",
    ],
  },
  {
    label: "Rank Verification",
    href: "/admin/rank-verification",
    icon: ShieldCheckIcon,
    roles: [
      "CHIEF_EXECUTIVE",
      "REGISTRAR",
    ],
  },
  {
    label: "Generate Reports",
    href: "/admin/generate-reports",
    icon: ChartBarSquareIcon,
    roles: [
      "CHIEF_EXECUTIVE",
      "REPORTS_OFFICER",
      "FINANCE_OFFICER",
    ],
  },
];

const BOTTOM_NAV_ITEMS = [
  {
    label: "Council Settings",
    href: "/admin/council-settings",
    icon: Cog6ToothIcon,
    roles: ["CHIEF_EXECUTIVE"],
  },
  {
    label: "Help Desk",
    href: "/admin/help-desk",
    icon: QuestionMarkCircleIcon,
    roles: [
      "CHIEF_EXECUTIVE",
      "MEMBERSHIP_OFFICER",
      "ACTIVITIES_OFFICER",
      "FINANCE_OFFICER",
      "REGISTRAR",
      "REPORTS_OFFICER",
    ],
  },
  {
    label: "Logout",
    href: "/logout",
    icon: ArrowLeftOnRectangleIcon,
    roles: [
      "CHIEF_EXECUTIVE",
      "MEMBERSHIP_OFFICER",
      "ACTIVITIES_OFFICER",
      "FINANCE_OFFICER",
      "REGISTRAR",
      "REPORTS_OFFICER",
    ],
  },
];

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
        <aside className="flex min-h-[calc(100vh-6rem)] w-64 shrink-0 flex-col justify-between rounded-2xl bg-white p-4 shadow-sm">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.filter((item) =>
              item.roles.includes(officerRole)
            ).map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 transition hover:bg-zinc-100"
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <nav className="flex flex-col gap-1">
            {BOTTOM_NAV_ITEMS.filter((item) =>
              item.roles.includes(officerRole)
            ).map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 transition hover:bg-zinc-100"
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}