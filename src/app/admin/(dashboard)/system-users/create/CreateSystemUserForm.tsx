"use client";
// src/app/admin/(dashboard)/system-users/create/CreateSystemUserForm.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminScope } from "@/lib/utils/admin-scope";

const ROLE_OPTIONS = [
  { value: "CHIEF_EXECUTIVE", label: "Local Council Admin" },
  { value: "MEMBERSHIP_OFFICER", label: "Membership Officer" },
  { value: "ACTIVITIES_OFFICER", label: "Activities Officer" },
  { value: "FINANCE_OFFICER", label: "Finance Officer" },
  { value: "REGISTRAR", label: "Registrar" },
  { value: "REPORTS_OFFICER", label: "Reports Officer" },
];

interface Props {
  scope: AdminScope;
  councils: { id: string; name: string }[];
  regions: { id: string; name: string }[];
}

function scopeContextLabel(scope: AdminScope): string | null {
  if (scope.tier === "COUNCIL") return "This account will be created for your council.";
  if (scope.tier === "REGIONAL") return "This account will be created for your region.";
  if (scope.tier === "NATIONAL") return "This account will be created at the national tier.";
  return null;
}

export default function CreateSystemUserForm({ scope, councils, regions }: Props) {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0].value);

  // Only relevant when scope.tier === "SUPER" -- everyone else inherits
  // their own tier automatically and never sees these controls.
  const [superScope, setSuperScope] = useState<"COUNCIL" | "REGIONAL" | "NATIONAL">("NATIONAL");
  const [councilId, setCouncilId] = useState("");
  const [regionId, setRegionId] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const contextLabel = scopeContextLabel(scope);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/admin/api/system-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          firstName,
          lastName,
          role,
          ...(scope.tier === "SUPER"
            ? {
                scope: superScope,
                councilId: superScope === "COUNCIL" ? councilId || null : null,
                regionId: superScope === "REGIONAL" ? regionId || null : null,
              }
            : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Unable to create system user.");
        setSubmitting(false);
        return;
      }

      router.push("/admin/system-users");
    } catch {
      setError("Unable to create system user. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm">
      {contextLabel && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {contextLabel}
        </p>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {scope.tier === "SUPER" && (
        <div className="rounded-lg border border-zinc-200 p-4">
          <p className="mb-2 text-sm font-medium text-zinc-700">Tier</p>
          <div className="mb-3 flex gap-4 text-sm text-zinc-800">
            {(["COUNCIL", "REGIONAL", "NATIONAL"] as const).map((tier) => (
              <label key={tier} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="super-scope"
                  checked={superScope === tier}
                  onChange={() => setSuperScope(tier)}
                  className="h-4 w-4"
                />
                {tier === "COUNCIL" ? "Council" : tier === "REGIONAL" ? "Regional" : "National"}
              </label>
            ))}
          </div>

          {superScope === "COUNCIL" && (
            <select
              value={councilId}
              onChange={(e) => setCouncilId(e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
            >
              <option value="" disabled>Select a council</option>
              {councils.map((council) => (
                <option key={council.id} value={council.id}>{council.name}</option>
              ))}
            </select>
          )}

          {superScope === "REGIONAL" && (
            <select
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              className="w-full rounded border px-3 py-2"
              required
            >
              <option value="" disabled>Select a region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>{region.name}</option>
              ))}
            </select>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">First Name</label>
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Last Name</label>
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">User Login (Username)</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border px-3 py-2"
          required
          minLength={8}
        />
      </div>

      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={() => router.push("/admin/system-users")}
          className="flex-1 rounded border border-zinc-300 px-4 py-2.5 text-zinc-700 hover:bg-zinc-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded bg-emerald-800 px-4 py-2.5 text-white transition-colors hover:bg-emerald-900 disabled:opacity-50"
        >
          {submitting ? "Creating..." : "Create System User"}
        </button>
      </div>
    </form>
  );
}
