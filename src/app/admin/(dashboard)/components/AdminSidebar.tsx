// src/app/admin/(dashboard)/components/AdminSidebar.tsx
import { getMenuForRole, type AdminRole } from "@/lib/auth/admin-menu";
import AdminSidebarClient from "./AdminSidebarClient";
// Render the admin sidebar by retrieving the filtered navigation menu based on the user's role and passing it to the client component.
export default function AdminSidebar({ role }: { role: AdminRole }) {
  const menu = getMenuForRole(role);
  return <aside className="w-64 shrink-0 border-r border-zinc-200 bg-white px-3 py-6"><AdminSidebarClient menu={menu} /></aside>;
}