"use client";
// src/app/admin/membership-review/RegistrationTable.tsx
// Table of pending registrations + click-to-open modal with full details
// and Approve/Reject actions.

import { useState } from "react";
import {
  approveRegistrationAction,
  rejectRegistrationAction,
} from "@/app/actions/admin";
import type { PendingRegistrationRecord } from "@/services/admin.service";

function calculateAge(birthdate: Date): number {
  const today = new Date();
  const bday = new Date(birthdate);
  let age = today.getFullYear() - bday.getFullYear();
  const monthDiff = today.getMonth() - bday.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bday.getDate())) {
    age--;
  }
  return age;
}

export default function RegistrationTable({
  registrations,
}: {
  registrations: PendingRegistrationRecord[];
}) {
  const [selected, setSelected] = useState<PendingRegistrationRecord | null>(
    null
  );
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rows, setRows] = useState(registrations);

  const closeModal = () => {
    setSelected(null);
    setFeedback("");
  };

  const handleApprove = async () => {
    if (!selected) return;
    setIsSubmitting(true);

    const result = await approveRegistrationAction(selected.id);

    if (result.success) {
      setRows((prev) => prev.filter((r) => r.id !== selected.id));
      closeModal();
    } else {
      alert(result.error ?? "Failed to approve registration.");
    }

    setIsSubmitting(false);
  };

  const handleReject = async () => {
    if (!selected) return;
    setIsSubmitting(true);

    const result = await rejectRegistrationAction(selected.id, feedback);

    if (result.success) {
      setRows((prev) => prev.filter((r) => r.id !== selected.id));
      closeModal();
    } else {
      alert(result.error ?? "Failed to reject registration.");
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-500 border-b">
            <th className="py-2 font-medium">Registration ID</th>
            <th className="py-2 font-medium">Name</th>
            <th className="py-2 font-medium">Scouting Position</th>
            <th className="py-2 font-medium">Type</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((reg) => (
            <tr
              key={reg.id}
              onClick={() => setSelected(reg)}
              className="border-b last:border-b-0 cursor-pointer hover:bg-zinc-50"
            >
              <td className="py-3 text-zinc-700">
                {reg.id.slice(0, 8).toUpperCase()}
              </td>
              <td className="py-3 text-zinc-900">{reg.fullName}</td>
              <td className="py-3 text-zinc-700">
                {reg.extraDetails.scoutingPosition ?? "—"}
              </td>
              <td className="py-3">
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full text-white ${
                    reg.isExistingScout ? "bg-indigo-600" : "bg-green-700"
                  }`}
                >
                  {reg.isExistingScout ? "Existing Scout" : "New Scout"}
                </span>
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="py-8 text-center text-zinc-400">
                No pending registrations.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 text-zinc-900">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-green-800">
                Membership Review{" "}
                <span className="text-zinc-400 font-normal ml-2">
                  {selected.isExistingScout ? "Existing Scout" : "New Scout"}
                </span>
              </h2>
              <button
                onClick={closeModal}
                className="text-red-600 border border-red-600 rounded-full w-7 h-7 flex items-center justify-center text-sm"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2">
                <label className="text-xs text-zinc-500">Name</label>
                <p className="border rounded px-3 py-2">{selected.fullName}</p>
              </div>

              <div>
                <label className="text-xs text-zinc-500">Age</label>
                <p className="border rounded px-3 py-2">
                  {calculateAge(selected.birthdate)}
                </p>
              </div>
              <div>
                <label className="text-xs text-zinc-500">Sex</label>
                <p className="border rounded px-3 py-2">{selected.sex}</p>
              </div>

              <div className="col-span-2">
                <label className="text-xs text-zinc-500">Address</label>
                <p
                  className={`border rounded px-3 py-2 ${
                    selected.address ? "text-zinc-900" : "text-zinc-400"
                  }`}
                >
                  {selected.address ?? "Not available yet"}
                </p>
              </div>

              <div className="col-span-2">
                <label className="text-xs text-zinc-500">Mobile Number</label>
                <p
                  className={`border rounded px-3 py-2 ${
                    selected.telephoneNumber ? "text-zinc-900" : "text-zinc-400"
                  }`}
                >
                  {selected.telephoneNumber ?? "Not available yet"}
                </p>
              </div>

              <div>
                <label className="text-xs text-zinc-500">Local Council</label>
                <p className="border rounded px-3 py-2">{selected.council}</p>
              </div>
              <div>
                <label className="text-xs text-zinc-500">Region</label>
                <p className="border rounded px-3 py-2">
                  {selected.extraDetails.region ?? "—"}
                </p>
              </div>

              <div>
                <label className="text-xs text-zinc-500">
                  Scouting Position
                </label>
                <p className="border rounded px-3 py-2">
                  {selected.extraDetails.scoutingPosition ?? "—"}
                </p>
              </div>
              <div>
                <label className="text-xs text-zinc-500">
                  Tenure in Scouting
                </label>
                <p className="border rounded px-3 py-2">
                  {selected.extraDetails.tenure ?? "—"}
                </p>
              </div>

              <div className="col-span-2">
                <label className="text-xs text-zinc-500">
                  Sponsoring Institution
                </label>
                <p className="border rounded px-3 py-2">
                  {selected.extraDetails.sponsoringInstitution ?? "—"}
                </p>
              </div>

              <div className="col-span-2">
                <label className="text-xs text-zinc-500">
                  Institution&apos;s Address
                </label>
                <p className="border rounded px-3 py-2 text-zinc-400">
                  Not available yet
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div>
                <p className="text-xs text-zinc-500 mb-1">Payment Status</p>
                <span
                  className={`text-xs font-medium px-4 py-1.5 rounded-full text-white ${
                    selected.paymentStatus === "paid"
                      ? "bg-green-700"
                      : selected.paymentStatus === "failed"
                      ? "bg-red-600"
                      : "bg-zinc-400"
                  }`}
                >
                  {selected.paymentStatus ?? "No payment"}
                </span>
              </div>

              <div>
                <p className="text-xs text-zinc-500 mb-1">Registration Type</p>
                <span className="text-xs font-medium px-4 py-1.5 rounded-full text-white bg-green-700">
                  {selected.isExistingScout ? "Renewal" : "New Scout"}
                </span>
              </div>
            </div>

            <hr className="my-4" />

            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Document Attachment</p>
              <div className="border-2 border-dashed rounded-lg h-40 flex items-center justify-center text-zinc-400 text-sm">
                Not available yet
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Rejection Feedback</p>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Type here"
                className="w-full border rounded-lg p-3 text-sm h-20 resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="flex-1 bg-green-800 text-white rounded-lg py-3 font-medium disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={handleReject}
                disabled={isSubmitting}
                className="flex-1 bg-red-600 text-white rounded-lg py-3 font-medium disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}