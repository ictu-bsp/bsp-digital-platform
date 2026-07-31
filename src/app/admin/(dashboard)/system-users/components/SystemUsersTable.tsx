// src/app/admin/(dashboard)/system-users/components/SystemUsersTable.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
// The admin service does not export AdminUserRecord in some setups —
// declare a local type to keep this component self-contained.
// Replace `any` with a stricter shape if you add or import a shared type later.
type AdminUserRecord = any;
import EditSystemUserModal from "./EditSystemUserModal";

const ROLE_LABELS: Record<string, string> = {
  CHIEF_EXECUTIVE: "Local Council Admin",
  MEMBERSHIP_OFFICER: "Membership Officer",
  ACTIVITIES_OFFICER: "Activities Officer",
  FINANCE_OFFICER: "Finance Officer",
  REGISTRAR: "Registrar",
  REPORTS_OFFICER: "Reports Officer",
};

// Formats a date value or string into a formatted locale date string or returns "Never"
function formatDate(value: Date | string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Never";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// Formats a date value or string into a formatted locale date string or returns a dash
function formatDateOrDash(value: Date | string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

// Renders a styled badge displaying "Yes" or "No" based on a boolean condition
function YesNoBadge({ value }: { value: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        value ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
      }`}
    >
      {value ? "Yes" : "No"}
    </span>
  );
}

// Renders a searchable data table displaying all system users and administrative actions
export default function SystemUsersTable({ users }: { users: AdminUserRecord[] }) {
  const router = useRouter();
  const [editingUser, setEditingUser] = useState<AdminUserRecord | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Filters the list of system users based on user search input
  const filteredUsers = users.filter((user) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const roleLabel = ROLE_LABELS[user.role] ?? user.role;
    return (
      user.username?.toLowerCase().includes(q) ||
      roleLabel.toLowerCase().includes(q) ||
      user.firstName?.toLowerCase().includes(q) ||
      user.lastName?.toLowerCase().includes(q) ||
      user.council?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q)
    );
  });

  // Handles closing the edit modal and refreshing page data after a successful save
  const onSaved = () => {
    setEditingUser(null);
    router.refresh();
  };

  // Handles deactivating a system user account after confirmation
  const onDeactivate = async (userId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this system user? This will disable their account."
    );
    if (!confirmed) return;
    setDeactivatingId(userId);
    try {
      const res = await fetch(`/admin/api/system-users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message ?? "Unable to deactivate system user.");
        return;
      }
      router.refresh();
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by login, role, name, council, or email..."
          className="w-full max-w-md rounded-lg border border-zinc-300 px-4 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700"
        />
      </div>
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-zinc-50 text-xs text-zinc-500 uppercase">
            <tr>
              <th className="sticky left-0 bg-zinc-50 px-5 py-5 font-semibold">Action</th>
              <th className="px-5 py-5 font-semibold">User Login</th>
              <th className="px-5 py-5 font-semibold">User Role</th>
              <th className="px-5 py-5 font-semibold">First Name</th>
              <th className="px-5 py-5 font-semibold">Last Name</th>
              <th className="px-5 py-5 font-semibold">Council</th>
              <th className="px-5 py-5 font-semibold">Status</th>
              <th className="px-5 py-5 font-semibold">Password Expiration</th>
              <th className="px-5 py-5 font-semibold">Account Lock Threshold</th>
              <th className="px-5 py-5 font-semibold">Incorrect Password Attempt</th>
              <th className="px-5 py-5 font-semibold">Email</th>
              <th className="px-5 py-5 font-semibold">Alternate Email</th>
              <th className="px-5 py-5 font-semibold">Profile Picture</th>
              <th className="px-5 py-5 font-semibold">First Time User</th>
              <th className="px-5 py-5 font-semibold">Can Change Password</th>
              <th className="px-5 py-5 font-semibold">Turn Off Email Notif</th>
              <th className="px-5 py-5 font-semibold">Locked</th>
              <th className="px-5 py-5 font-semibold">Added By</th>
              <th className="px-5 py-5 font-semibold">Added Date</th>
              <th className="px-5 py-5 font-semibold">Last Login</th>
              <th className="px-5 py-5 font-semibold">Deleted Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="text-zinc-800">
                <td className="sticky left-0 bg-white px-5 py-5">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingUser(user)}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      Edit
                    </button>
                    {!user.deletedAt && (
                      <button
                        type="button"
                        disabled={deactivatingId === user.id}
                        onClick={() => onDeactivate(user.id)}
                        className="font-medium text-red-600 hover:underline disabled:opacity-50"
                      >
                        {deactivatingId === user.id ? "Deactivating..." : "Deactivate"}
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-5 py-5 text-zinc-500">{user.username}</td>
                <td className="px-5 py-5">{ROLE_LABELS[user.role] ?? user.role}</td>
                <td className="px-5 py-5">{user.firstName ?? "—"}</td>
                <td className="px-5 py-5">{user.lastName ?? "—"}</td>
                <td className="px-5 py-5">{user.council}</td>
                <td className="px-5 py-5">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      user.active
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    {user.active ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="px-5 py-5 text-zinc-500">
                  {formatDateOrDash(user.passwordExpiration)}
                </td>
                <td className="px-5 py-5">{user.accountLockThreshold ?? "—"}</td>
                <td className="px-5 py-5">{user.incorrectPasswordAttempts}</td>
                <td className="px-5 py-5 text-zinc-500">{user.email ?? "—"}</td>
                <td className="px-5 py-5 text-zinc-500">{user.alternateEmail ?? "—"}</td>
                <td className="px-5 py-5 text-zinc-500">
                  {user.profilePicture ? (
                    <a
                      href={user.profilePicture}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-5 py-5">
                  <YesNoBadge value={user.firstTimeUser} />
                </td>
                <td className="px-5 py-5">
                  <YesNoBadge value={user.canChangePassword} />
                </td>
                <td className="px-5 py-5">
                  <YesNoBadge value={user.turnOffEmailNotif} />
                </td>
                <td className="px-5 py-5">
                  <YesNoBadge value={user.locked} />
                </td>
                <td className="px-5 py-5 text-zinc-500">{user.addedByName ?? "—"}</td>
                <td className="px-5 py-5 text-zinc-500">{formatDate(user.createdAt)}</td>
                <td className="px-5 py-5 text-zinc-500">{formatDate(user.lastLoginAt)}</td>
                <td className="px-5 py-5 text-zinc-500">{formatDateOrDash(user.deletedAt)}</td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={21} className="px-5 py-8 text-center text-zinc-400">
                  {users.length === 0
                    ? "No system user accounts found."
                    : "No users match your search."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {editingUser && (
        <EditSystemUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={onSaved}
        />
      )}
    </>
  );
}