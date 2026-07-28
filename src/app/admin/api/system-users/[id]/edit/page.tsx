// src/app/admin/api/system-users/[id]/edit/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const ROLE_OPTIONS = [
  { value: "CHIEF_EXECUTIVE", label: "Local Council Admin" },
  { value: "MEMBERSHIP_OFFICER", label: "Membership Officer" },
  { value: "ACTIVITIES_OFFICER", label: "Activities Officer" },
  { value: "FINANCE_OFFICER", label: "Finance Officer" },
  { value: "REGISTRAR", label: "Registrar" },
  { value: "REPORTS_OFFICER", label: "Reports Officer" },
];

function toDateInputValue(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function EditSystemUserPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [alternateEmail, setAlternateEmail] = useState("");
  const [passwordExpiration, setPasswordExpiration] = useState("");
  const [accountLockThreshold, setAccountLockThreshold] = useState("5");
  const [incorrectPasswordAttempts, setIncorrectPasswordAttempts] = useState(0);

  const [firstTimeUser, setFirstTimeUser] = useState(false);
  const [canChangePassword, setCanChangePassword] = useState(false);
  const [turnOffEmailNotif, setTurnOffEmailNotif] = useState(false);
  const [locked, setLocked] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/system-users/${id}`)
      .then(async (res) => {
        if (res.status === 404) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const data = await res.json();
        const u = data.adminUser;

        setUsername(u.username);
        setFirstName(u.firstName ?? "");
        setLastName(u.lastName ?? "");
        setRole(u.role);
        setEmail(u.email ?? "");
        setAlternateEmail(u.alternateEmail ?? "");
        setPasswordExpiration(toDateInputValue(u.passwordExpiration));
        setAccountLockThreshold(
          u.accountLockThreshold !== null ? String(u.accountLockThreshold) : "5"
        );
        setIncorrectPasswordAttempts(u.incorrectPasswordAttempts ?? 0);
        setFirstTimeUser(Boolean(u.firstTimeUser));
        setCanChangePassword(Boolean(u.canChangePassword));
        setTurnOffEmailNotif(Boolean(u.turnOffEmailNotif));
        setLocked(Boolean(u.locked));

        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load system user.");
        setLoading(false);
      });
  }, [id]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/admin/system-users/${id}`, {
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

      router.push("/admin/system-users");
    } catch {
      setError("Unable to update system user. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-zinc-500">Loading system user...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="p-8">
        <p className="text-zinc-500">System user not found.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-2xl text-zinc-700 mb-2"
        aria-label="Go back"
      >
        &lt;
      </button>

      <h1 className="text-2xl font-bold text-emerald-800 mb-1">Edit System User</h1>
      <p className="text-zinc-500 mb-6">
        Incorrect password attempts: {incorrectPasswordAttempts}
      </p>

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

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-emerald-800 hover:bg-emerald-900 transition-colors text-white py-2.5 px-4 mt-4 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}