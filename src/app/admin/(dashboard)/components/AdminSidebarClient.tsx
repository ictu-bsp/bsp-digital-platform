// src/app/admin/(dashboard)/components/AdminSidebarClient.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AdminMenuItem } from "@/lib/auth/admin-menu";
// Render the client-side navigation menu and manage logout requests.
export default function AdminSidebarClient({ menu }: { menu: AdminMenuItem[] }) {
  const pathname = usePathname();
  const router = useRouter();
  // Call the logout API endpoint, refresh router state to clear cached routes, and redirect to login.
  const onLogout = async () => {
    await fetch("/admin/api/logout-officer", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };
  return (
    <nav className="flex flex-col gap-1">
      {menu.map((item) => {
        const active = pathname === item.href;
        return <Link key={item.href} href={item.href} className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${active ? "bg-green-800 text-white" : "text-zinc-700 hover:bg-zinc-100"}`}>{item.label}</Link>;
      })}
      <button type="button" onClick={onLogout} className="mt-4 rounded-lg px-4 py-2.5 text-sm font-medium text-left text-red-700 hover:bg-red-50">Logout</button>
    </nav>
  );
}