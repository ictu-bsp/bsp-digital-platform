// src/lib/auth/admin-menu.ts
// Central definition of every admin sidebar item and which
// adminUsers.role values are allowed to see it.
// To add/remove a menu item or change access, edit ONLY this file —
// AdminSidebar.tsx just reads from here.

export type AdminRole =
  | "CHIEF_EXECUTIVE"
  | "MEMBERSHIP_OFFICER"
  | "ACTIVITIES_OFFICER"
  | "FINANCE_OFFICER"
  | "REGISTRAR"
  | "REPORTS_OFFICER";

export type AdminMenuItem = {
  label: string;
  href: string;
  roles: AdminRole[] | "ALL";
};

// NOTE: items marked (TODO) point to routes that don't exist in the
// project yet based on your current directory tree. Once those pages
// are built, just update the href string below — nothing else changes.
export const ADMIN_MENU: AdminMenuItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    roles: "ALL",
  },
  {
    label: "Membership Review",
    href: "/admin/membership-review",
    roles: ["CHIEF_EXECUTIVE", "MEMBERSHIP_OFFICER"],
  },
  {
    label: "Scout Roster",
    href: "/admin/scout-roster",
    roles: [
      "CHIEF_EXECUTIVE",
      "MEMBERSHIP_OFFICER",
      "ACTIVITIES_OFFICER",
      "REGISTRAR",
    ],
  },

{
    label: "Activities",
    href: "/admin/activities",
    roles: ["CHIEF_EXECUTIVE", "REGISTRAR", "ACTIVITIES_OFFICER"],
  },

  {
    label: "System Users", // create/manage admin (system user) accounts
    href: "/admin/system-users",
    roles: ["CHIEF_EXECUTIVE"],
  },
  {
    label: "Announcement Hub",
    href: "/admin/announcements",
    roles: ["CHIEF_EXECUTIVE"],
  },
  {
    label: "Finance",
    href: "/admin/finance",
    roles: ["CHIEF_EXECUTIVE", "FINANCE_OFFICER"],
  },
  {
    label: "Generate Reports", // (TODO) folder not built yet
    href: "/admin/reports",
    roles: ["CHIEF_EXECUTIVE", "REPORTS_OFFICER"],
  },
  {
    label: "Help Desk", // (TODO) folder not built yet
    href: "/admin/help-desk",
    roles: "ALL",
  },
];

export function getMenuForRole(role: AdminRole): AdminMenuItem[] {
  return ADMIN_MENU.filter(
    (item) => item.roles === "ALL" || item.roles.includes(role)
  );
}