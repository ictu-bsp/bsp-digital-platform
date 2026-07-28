"use client";
// src/app/admin/(dashboard)/system-users/components/EditSystemUserModal.tsx

import { useState } from "react";
import type { AdminUserRecord } from "@/services/admin.service";

const ROLE_OPTIONS = [
  { value: "CHIEF_EXECUTIVE", label: "Local Council Admin" },
  { value: "MEMBERSHIP_OFFICER", label: "Membership Officer" },
  { value: "ACTIVITIES_OFFICER", label: "Activities Officer" },
  { value: "FINANCE_OFFICER", label: "Finance Officer" },
  { value: "REGISTRAR", label: "Registrar" },
  { value: "REPORTS_OFFICER", label: "Reports Officer" },
];

function toDateInputValue(value: Date | string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function EditSystemUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUserRecord;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [role, setRole] = useState(user.role);
  const [email, setEmail] = useState(user.email ?? "");
  const [alternateEmail, setAlternateEmail] = useState(user.alternateEmail ?? "");
  const [passwordExpiration, setPasswordExpiration] = useState(
    toDateInputValue(user.passwordExpiration)
  );
  const [accountLockThreshold, setAccountLockThreshold] = useState(
    user.accountLockThreshold !== null ? String(user.accountLockThreshold) : "5"
  );

  const [firstTimeUser, setFirstTimeUser] = useState(user.firstTimeUser);
  const [canChangePassword, setCanChangePassword] = useState(user.canChangePassword);
  const [turnOffEmailNotif, setTurnOffEmailNotif] = useState(user.turnOffEmailNotif);
  const [locked, setLocked] = useState(user.locked);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/system-users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          ...(password ? { password } : {}),
          firstName,
          lastName,
          role,
          email,
          alternateEmail,
          passwordExpiration: passwordExpiration || null,
          accountLockThreshold,
          firstTimeUser,
          canChangePassword,
          turnOffEmailNotif,
          locked,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Unable to update system user.");
        setSubmitting(false);
        return;
      }

      onSaved();
    } catch {
      setError("Unable to update system user. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-emerald-800">Edit System User</h2>
            <p className="text-zinc-500 text-sm mt-1">
              Incorrect password attempts: {user.incorrectPasswordAttempts}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 text-2xl leading-none"
            aria-label="Close"
          >
            
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                First Name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Last Name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border rounded px-3 py-2 w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              User Login (Username)
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              User Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Reset Password (leave blank to keep current password)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Password Expiration
              </label>
              <input
                type="date"
                value={passwordExpiration}
                onChange={(e) => setPasswordExpiration(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Account Lock Threshold
              </label>
              <input
                type="number"
                min={1}
                value={accountLockThreshold}
                onChange={(e) => setAccountLockThreshold(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Alternate Email
              </label>
              <input
                type="email"
                value={alternateEmail}
                onChange={(e) => setAlternateEmail(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>
          </div>

          <hr className="my-2" />

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm text-zinc-800">
              <input
                type="checkbox"
                checked={firstTimeUser}
                onChange={(e) => setFirstTimeUser(e.target.checked)}
                className="w-4 h-4"
              />
              First Time User
            </label>

            <label className="flex items-center gap-2 text-sm text-zinc-800">
              <input
                type="checkbox"
                checked={canChangePassword}
                onChange={(e) => setCanChangePassword(e.target.checked)}
                className="w-4 h-4"
              />
              Can Change Password
            </label>

            <label className="flex items-center gap-2 text-sm text-zinc-800">
              <input
                type="checkbox"
                checked={turnOffEmailNotif}
                onChange={(e) => setTurnOffEmailNotif(e.target.checked)}
                className="w-4 h-4"
              />
              Turn Off Email Notification
            </label>

            <label className="flex items-center gap-2 text-sm text-zinc-800">
              <input
                type="checkbox"
                checked={locked}
                onChange={(e) => setLocked(e.target.checked)}
                className="w-4 h-4"
              />
              Lock Account
            </label>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded border border-zinc-300 text-zinc-700 py-2.5 px-4 hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded bg-emerald-800 hover:bg-emerald-900 transition-colors text-white py-2.5 px-4 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}