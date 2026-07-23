"use client";
// src/app/admin/(dashboard)/components/AdminSidebarClient.tsx

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AdminMenuItem } from "@/lib/auth/admin-menu";

export default function AdminSidebarClient({
  menu,
}: {
  menu: AdminMenuItem[];
}) {
  const pathname = usePathname();
  const router = useRouter();

  const onLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <nav className="flex flex-col gap-1">
      {menu.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-green-800 text-white"
                : "text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {item.label}
          </Link>
        );
      })}

      <button
        type="button"
        onClick={onLogout}
        className="mt-4 rounded-lg px-4 py-2.5 text-sm font-medium text-left text-red-700 hover:bg-red-50"
      >
        Logout
      </button>
    </nav>
  );
}