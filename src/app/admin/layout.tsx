"use client";
// src/app/admin/layout.tsx
// Shared sidebar + top bar for all /admin/* pages.
// TODO: "Bulacan Council" / "BC" initials are hardcoded — replace with real
// session/council data once available.

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ClipboardList,
  Users,
  Megaphone,
  BadgeCheck,
  FileBarChart,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutGrid },
  { label: "Membership Review", href: "/admin/membership-review", icon: ClipboardList },
  { label: "Scout Roster", href: "/admin/scout-roster", icon: Users },
  { label: "Announcement Hub", href: "/admin/announcement-hub", icon: Megaphone },
  { label: "Rank Verification", href: "/admin/rank-verification", icon: BadgeCheck },
  { label: "Generate Reports", href: "/admin/generate-reports", icon: FileBarChart },
];

const BOTTOM_NAV_ITEMS = [
  { label: "Council Settings", href: "/admin/council-settings", icon: Settings },
  { label: "Help Desk", href: "/admin/help-desk", icon: HelpCircle },
  { label: "Logout", href: "/logout", icon: LogOut },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-zinc-100 p-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="bg-white rounded-full px-5 py-2 shadow-sm">
          <span className="text-xl font-bold text-green-800">
            eScout<span className="text-zinc-400 font-medium text-sm ml-1">Admin</span>
          </span>
        </div>

        <div className="bg-white rounded-full pl-2 pr-4 py-1.5 shadow-sm flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-green-800 text-white flex items-center justify-center text-xs font-semibold">
            BC
          </span>
          <span className="text-sm font-medium text-zinc-800">Bulacan Council</span>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Sidebar */}
        <aside className="w-64 shrink-0 bg-white rounded-2xl shadow-sm p-4 flex flex-col justify-between min-h-[calc(100vh-6rem)]">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 text-sm px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-green-800 text-white font-medium"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <nav className="flex flex-col gap-1">
            {BOTTOM_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 text-sm px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-green-800 text-white font-medium"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}