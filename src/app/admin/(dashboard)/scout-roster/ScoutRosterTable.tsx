// src/app/admin/scout-roster/ScoutRosterTable.tsx
"use client";
import { useState } from "react";
import { toggleScoutMembershipAction, deleteScoutPermanentlyAction } from "@/app/actions/scouts";
type RosterRow = {
  scoutId: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  councilName: string | null;
  membershipNumber: string | null;
  rank: string;
  status: string;
  isActive: boolean;
  joinedAt: Date | null;
  validUntil: string | null;
};
interface Props {
  initialRoster: RosterRow[];
}

function getValidityInfo(validUntil: string | null) {
  if (!validUntil) {
    return { label: "No Record", className: "bg-zinc-100 text-zinc-500", dateText: "—" };
  }

  const endDate = new Date(validUntil);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateText = endDate.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  if (endDate < today) {
    return { label: "Expired", className: "bg-red-100 text-red-700", dateText };
  }

  return { label: "Valid", className: "bg-green-100 text-green-700", dateText };
}

// Manage and display the client-side scout roster table with search filtering and toggle/delete actions.
export function ScoutRosterTable({ initialRoster }: Props) {
  const [roster, setRoster] = useState<RosterRow[]>(initialRoster);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  // Toggle the active membership status of a specific scout.
  const handleToggle = async (scoutId: string, currentlyActive: boolean) => {
    setPendingId(scoutId);
    const result = await toggleScoutMembershipAction(scoutId, !currentlyActive);
    setPendingId(null);
    if (!result.success || !result.data) {
      alert(result.error ?? "Failed to update membership.");
      return;
    }
    setRoster((prev) => prev.map((row) =>
      (row.scoutId === scoutId ? { ...row, isActive: !currentlyActive } : row)));
  };
  // Permanently delete a scout's record and remove them from local state.
  const handleDelete = async (scoutId: string, scoutName: string) => {
    const confirmed = window.confirm(
      `Permanently delete ${scoutName}'s scout membership, registrations,
       and payment records? This cannot be undone. The user's account will NOT be deleted.`);
    if (!confirmed) return;
    setDeletingId(scoutId);
    const result = await deleteScoutPermanentlyAction(scoutId);
    setDeletingId(null);
    if (!result.success) {
      alert(result.error ?? "Failed to delete scout.");
      return;
    }
    setRoster((prev) => prev.filter((row) => row.scoutId !== scoutId));
  };
  const filteredRoster = roster.filter((row) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    const fullName = `${row.firstName ?? ""} ${row.lastName ?? ""}`.toLowerCase();
    return (
      fullName.includes(query) ||
      (row.email ?? "").toLowerCase().includes(query) ||
      (row.councilName ?? "").toLowerCase().includes(query) ||
      (row.membershipNumber ?? "").toLowerCase().includes(query) ||
      row.rank.toLowerCase().includes(query)
    );
  });
  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, email, council, membership no., or scout type..."
        className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-green-800"
      />
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md p-4 bg-white">
        <table className="w-full text-left text-sm text-gray-500">
        <thead className="bg-green-800 text-xs text-white uppercase font-semibold">
          <tr>
            <th className="px-4 py-3">Scout Name</th>
            <th className="px-4 py-3">Email Address</th>
            <th className="px-4 py-3">Council</th>
            <th className="px-4 py-3">Membership No.</th>
            <th className="px-4 py-3">Scout Type</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Validity</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {filteredRoster.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                {roster.length === 0
                  ? "No scouts have registered yet."
                  : "No scouts match your search."}
              </td>
            </tr>
          )}

          {filteredRoster.map((row) => (
            <tr key={row.scoutId} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">
                {row.lastName}, {row.firstName}
              </td>

              <td className="px-4 py-3">{row.email}</td>

              <td className="px-4 py-3">{row.councilName}</td>

              <td className="px-4 py-3">
                {row.membershipNumber ?? "—"}
              </td>

              <td className="px-4 py-3">{row.rank || "—"}</td>

              <td className="px-4 py-3">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    !row.isActive
                      ? "bg-red-100 text-red-700"
                      : row.status === "ACTIVE"
                      ? "bg-green-100 text-green-700"
                      : row.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : row.status === "SUSPENDED"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {!row.isActive ? "Revoked" : row.status}
                </span>
              </td>

              <td className="px-4 py-3">
                {(() => {
                  const validity = getValidityInfo(row.validUntil);
                  return (
                    <div className="flex flex-col gap-1">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded w-fit ${validity.className}`}
                      >
                        {validity.label}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {validity.dateText}
                      </span>
                    </div>
                  );
                })()}
              </td>

              <td className="px-4 py-3">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleToggle(row.scoutId, row.isActive)}
                    disabled={pendingId === row.scoutId || deletingId === row.scoutId}
                    className={`text-xs font-bold px-3 py-1.5 rounded transition-all shadow-sm text-white disabled:opacity-50 ${row.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-700 hover:bg-green-600"}`}
                  >
                    {pendingId === row.scoutId ? "Updating..." : row.isActive ? "Revoke Membership" : "Restore Membership"}
                  </button>
                    <button
                      onClick={() => handleDelete(row.scoutId, `${row.firstName} ${row.lastName}`)}
                      disabled={deletingId === row.scoutId || pendingId === row.scoutId}
                      className="text-xs font-bold px-3 py-1.5 rounded transition-all shadow-sm text-white bg-zinc-800 hover:bg-black disabled:opacity-50"
                    >
                      {deletingId === row.scoutId ? "Deleting..." : "Delete Permanently"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}