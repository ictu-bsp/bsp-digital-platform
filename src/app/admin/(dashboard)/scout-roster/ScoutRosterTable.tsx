"use client";
// src/app/admin/scout-roster/ScoutRosterTable.tsx
// Admin roster: lists every scout who has an account + a scouts row,
// with a toggle to flip isActive on/off. This is a TESTING utility —
// it flips `scouts.isActive`, not the `status` lifecycle enum
// (PENDING/ACTIVE/SUSPENDED/EXPIRED), which stays tied to the
// approval workflow and is untouched by this page.

import { useState } from "react";
import {
  toggleScoutMembershipAction,
  deleteScoutPermanentlyAction,
} from "@/app/actions/scouts";

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
};

interface Props {
  initialRoster: RosterRow[];
}

export function ScoutRosterTable({ initialRoster }: Props) {
  const [roster, setRoster] = useState<RosterRow[]>(initialRoster);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleToggle = async (scoutId: string, currentlyActive: boolean) => {
    setPendingId(scoutId);
    const result = await toggleScoutMembershipAction(
      scoutId,
      !currentlyActive
    );
    setPendingId(null);

    if (!result.success || !result.data) {
      alert(result.error ?? "Failed to update membership.");
      return;
    }

    setRoster((prev) =>
      prev.map((row) =>
        row.scoutId === scoutId ? { ...row, isActive: !currentlyActive } : row
      )
    );
  };

  const handleDelete = async (scoutId: string, scoutName: string) => {
    const confirmed = window.confirm(
      `Permanently delete ${scoutName}'s scout membership, registrations, and payment records? This cannot be undone. The user's account will NOT be deleted.`
    );
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

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md p-4 bg-white">
      <table className="w-full text-left text-sm text-gray-500">
        <thead className="bg-green-800 text-xs text-white uppercase font-semibold">
          <tr>
            <th className="px-4 py-3">Scout Name</th>
            <th className="px-4 py-3">Email Address</th>
            <th className="px-4 py-3">Council</th>
            <th className="px-4 py-3">Membership No.</th>
            <th className="px-4 py-3">App Status</th>
            <th className="px-4 py-3">Membership</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {roster.map((row) => (
            <tr key={row.scoutId} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">
                {row.lastName}, {row.firstName}
              </td>

              <td className="px-4 py-3">{row.email}</td>

              <td className="px-4 py-3">{row.councilName}</td>

              <td className="px-4 py-3">
                {row.membershipNumber ?? "—"}
              </td>

              <td className="px-4 py-3">{row.status}</td>

              <td className="px-4 py-3">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    row.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {row.isActive ? "Active" : "Revoked"}
                </span>
              </td>

              <td className="px-4 py-3">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleToggle(row.scoutId, row.isActive)}
                    disabled={pendingId === row.scoutId || deletingId === row.scoutId}
                    className={`text-xs font-bold px-3 py-1.5 rounded transition-all shadow-sm text-white disabled:opacity-50 ${
                      row.isActive
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-700 hover:bg-green-600"
                    }`}
                  >
                    {pendingId === row.scoutId
                      ? "Updating..."
                      : row.isActive
                      ? "Revoke Membership"
                      : "Restore Membership"}
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(row.scoutId, `${row.firstName} ${row.lastName}`)
                    }
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
  );
}