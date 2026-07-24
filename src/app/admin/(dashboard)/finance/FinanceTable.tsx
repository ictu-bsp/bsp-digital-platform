"use client";
// src/app/admin/(dashboard)/finance/FinanceTable.tsx
// Table of registrations awaiting Finance verification + click-to-open
// modal with payment details and a "Verify & Push to Records" action.

import { useState } from "react";
import { verifyAndActivateRegistrationAction } from "@/app/actions/admin";
import type { PendingRegistrationRecord } from "@/services/admin.service";

export default function FinanceTable({
  registrations,
}: {
  registrations: PendingRegistrationRecord[];
}) {
  const [selected, setSelected] = useState<PendingRegistrationRecord | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rows, setRows] = useState(registrations);

  const closeModal = () => {
    setSelected(null);
  };

  const handleVerifyAndPush = async () => {
    if (!selected) return;
    setIsSubmitting(true);

    const result = await verifyAndActivateRegistrationAction(selected.id);

    if (result.success) {
      setRows((prev) => prev.filter((r) => r.id !== selected.id));
      closeModal();
    } else {
      alert(result.error ?? "Failed to verify and activate registration.");
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
            <th className="py-2 font-medium">Council</th>
            <th className="py-2 font-medium">Payment Status</th>
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
              <td className="py-3 text-zinc-700">{reg.council}</td>
              <td className="py-3">
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full text-white ${
                    reg.paymentStatus === "paid"
                      ? "bg-green-700"
                      : reg.paymentStatus === "failed"
                      ? "bg-red-600"
                      : "bg-zinc-400"
                  }`}
                >
                  {reg.paymentStatus ?? "No payment"}
                </span>
              </td>
            </tr>
          ))}

          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="py-8 text-center text-zinc-400">
                No registrations awaiting finance verification.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 text-zinc-900">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-green-800">
                Finance Verification
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
                <label className="text-xs text-zinc-500">Council</label>
                <p className="border rounded px-3 py-2">{selected.council}</p>
              </div>

              <div>
                <label className="text-xs text-zinc-500">Registration Years</label>
                <p className="border rounded px-3 py-2">{selected.registrationYears}</p>
              </div>

              <div className="col-span-2">
                <label className="text-xs text-zinc-500">Payment Status</label>
                <p className="border rounded px-3 py-2">
                  {selected.paymentStatus ?? "No payment"}
                </p>
              </div>

              <div className="col-span-2">
                <label className="text-xs text-zinc-500">Payment Intent ID</label>
                <p className="border rounded px-3 py-2 text-zinc-500 text-xs">
                  {selected.paymentIntentId ?? "—"}
                </p>
              </div>
            </div>

            <button
              onClick={handleVerifyAndPush}
              disabled={isSubmitting || selected.paymentStatus !== "paid"}
              className="w-full bg-green-800 text-white rounded-lg py-3 font-medium disabled:opacity-50"
            >
              {selected.paymentStatus !== "paid"
                ? "Cannot push — payment not confirmed"
                : "Verify & Push to Records"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}