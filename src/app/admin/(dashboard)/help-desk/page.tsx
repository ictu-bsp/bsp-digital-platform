"use client";

import { useState } from "react";

const ISSUE_CATEGORIES = [
  { value: "system_bug", label: "System Bug / Error" },
  { value: "payment", label: "Payment Gateway Issue" },
  { value: "data_issue", label: "Incorrect / Missing Data" },
  { value: "access", label: "Access / Permissions Issue" },
  { value: "other", label: "Other" },
];

export default function AdminHelpDeskPage() {
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [showSentModal, setShowSentModal] = useState(false);

  const canSubmit = category !== "" && message.trim().length > 0;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // NOTE: Backend/DB storage for admin help desk reports is not
    // implemented yet. This is a placeholder flow only — submissions are
    // not persisted or actually routed to the Super Admin anywhere.
    // Once a support-tickets table + notification path exists, replace
    // this block with an actual POST to an API route (e.g. /api/admin/help-desk).

    setShowSentModal(true);
    setCategory("");
    setMessage("");
  };

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-zinc-800">Help Desk</h1>
      <p className="text-zinc-500 mt-1 mb-6">
        Running into a technical issue or bug? Send a report to the Super
        Admin below.
      </p>

      <form
        onSubmit={onSubmit}
        className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4 max-w-xl"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-zinc-700">
            Issue Type
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-zinc-300 rounded-lg px-3 py-2.5 text-zinc-900"
            required
          >
            <option value="" disabled>
              Select an issue type
            </option>
            {ISSUE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-zinc-700">
            Describe the issue
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            placeholder="Describe what happened, any error messages, and steps to reproduce..."
            className="border border-zinc-300 rounded-lg px-3 py-2.5 text-zinc-900 resize-none"
            required
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-emerald-800 hover:bg-emerald-900 transition-colors text-white text-base font-medium py-3 disabled:opacity-40"
        >
          Send to Super Admin
        </button>
      </form>

      {showSentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-xs"
          onClick={() => setShowSentModal(false)}
        >
          <div
            className="w-full max-w-xs rounded-2xl bg-white shadow-2xl p-7 flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <svg
                viewBox="0 0 24 24"
                className="w-9 h-9 text-emerald-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="12" cy="12" r="10" />
                <path
                  d="M8 12.5l2.5 2.5L16 9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-emerald-800 mb-1">
              Message Sent
            </h3>
            <p className="text-sm text-zinc-500 mb-5">
              Your report has been sent to the Super Admin. They&apos;ll
              follow up if needed.
            </p>
            <button
              onClick={() => setShowSentModal(false)}
              className="w-full rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-medium py-2.5"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}