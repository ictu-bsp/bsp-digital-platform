// src/app/admin/(dashboard)/finance/FinanceTable.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifyAndActivateRegistrationAction, updatePaymentStatusAction, syncPaymentStatusAction } from "@/app/actions/admin";
import type { PendingRegistrationRecord } from "@/services/admin.service";

export default function FinanceTable({ registrations }: { registrations: PendingRegistrationRecord[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<PendingRegistrationRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [rows, setRows] = useState(registrations);
  // Synchronize internal rows state whenever incoming registrations prop updates
  useEffect(() => { setRows(registrations); }, [registrations]);
  // Reset selected registration state to close the verification modal
  const closeModal = () => { setSelected(null); };
  // Trigger server action to verify payment and remove verified registration from active list
  const handleVerifyAndPush = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    const result = await verifyAndActivateRegistrationAction(selected.id);
    if (result.success) {
      setRows((prev) => prev.filter((r) => r.id !== selected.id));
      closeModal();
      router.refresh();
    } else {
      alert(result.error ?? "Failed to verify and activate registration.");
    }
    setIsSubmitting(false);
  };
  // Re-check live payment status directly with payment provider API
  const handleRecheckGateway = async () => {
    if (!selected || !selected.paymentIntentId) return;
    setIsSyncing(true);
    const result = await syncPaymentStatusAction(selected.id, selected.paymentIntentId);
    if (result.success && result.paymentStatus) {
      const updatedRecord = { ...selected, paymentStatus: result.paymentStatus };
      setSelected(updatedRecord);
      setRows((prev) => prev.map((r) => (r.id === selected.id ? updatedRecord : r)));
    } else {
      alert(result.error ?? "Payment is still not detected by gateway.");
    }
    setIsSyncing(false);
  };
  // Manual override: Force update payment status to paid
  const handleManualMarkAsPaid = async () => {
    if (!selected) return;
    setIsUpdatingStatus(true);
    const result = await updatePaymentStatusAction(selected.id, "paid");
    if (result.success) {
      const updatedRecord = { ...selected, paymentStatus: "paid" };
      setSelected(updatedRecord);
      setRows((prev) => prev.map((r) => (r.id === selected.id ? updatedRecord : r)));
    } else {
      alert(result.error ?? "Failed to update payment status.");
    }
    setIsUpdatingStatus(false);
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
            <tr key={reg.id} onClick={() => setSelected(reg)} className="border-b last:border-b-0 cursor-pointer hover:bg-zinc-50">
              <td className="py-3 text-zinc-700">{String(reg.id ?? "").slice(0, 8).toUpperCase()}</td>
              <td className="py-3 text-zinc-900">{reg.fullName}</td>
              <td className="py-3 text-zinc-700">{reg.council}</td>
              <td className="py-3">
                <span className={`text-xs font-medium px-3 py-1 rounded-full text-white ${reg.paymentStatus === "paid" ? "bg-green-700" : reg.paymentStatus === "failed" ? "bg-red-600" : "bg-amber-600"}`}>
                  {reg.paymentStatus ?? "No payment"}
                </span>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="py-8 text-center text-zinc-400">No registrations awaiting finance verification.</td>
            </tr>
          )}
        </tbody>
      </table>
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 text-zinc-900">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-green-800">Finance Verification</h2>
              <button onClick={closeModal} className="text-red-600 border border-red-600 rounded-full w-7 h-7 flex items-center justify-center text-sm" aria-label="Close">✕</button>
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
                <label className="text-xs text-zinc-500">Registration Type</label>
                <p className="border rounded px-3 py-2">{selected.registrationYears === 1 ? "Single-Year" : `Multi-Year (${selected.registrationYears} yrs)`}</p>
              </div>
              <div>
                <label className="text-xs text-zinc-500">Amount to Pay</label>
                <p className="border rounded px-3 py-2 font-medium">₱{selected.amount?.toLocaleString() ?? 0}</p>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-zinc-500">Payment Status</label>
                <div className="flex items-center justify-between border rounded px-3 py-2">
                  <span className="font-semibold capitalize">{selected.paymentStatus ?? "No payment"}</span>
                  {selected.paymentStatus !== "paid" && (
                    <div className="flex gap-2">
                      {selected.paymentIntentId && (
                        <button type="button" onClick={handleRecheckGateway} disabled={isSyncing} className="text-xs bg-blue-700 hover:bg-blue-800 text-white px-2.5 py-1 rounded transition-colors disabled:opacity-50">
                          {isSyncing ? "Checking..." : "Re-check Gateway"}
                        </button>
                      )}
                      <button type="button" onClick={handleManualMarkAsPaid} disabled={isUpdatingStatus} className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded transition-colors disabled:opacity-50">
                        {isUpdatingStatus ? "Updating..." : "Mark as Paid"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-zinc-500">Payment Intent ID</label>
                <p className="border rounded px-3 py-2 text-zinc-500 text-xs">{selected.paymentIntentId ?? "—"}</p>
              </div>
            </div>
            <button onClick={handleVerifyAndPush} disabled={isSubmitting || selected.paymentStatus !== "paid"} className="w-full bg-green-800 hover:bg-green-900 transition-colors text-white rounded-lg py-3 font-medium disabled:opacity-50">
              {isSubmitting ? "Processing..." : selected.paymentStatus !== "paid" ? "Cannot push — payment not confirmed" : "Verify & Push to Records"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}