"use client";
// src/app/admin/components/MonthRangePicker.tsx
// Working month-range dropdown for the admin dashboard.
// Selecting a range updates the URL's ?from=YYYY-MM&to=YYYY-MM query params
// so the selection persists on refresh. Not yet wired to filter any data.

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type MonthYear = { month: number; year: number };

function parseParam(value: string | null, fallback: MonthYear): MonthYear {
  if (!value) return fallback;
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return fallback;
  return { year, month: month - 1 };
}

export default function MonthRangePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const now = new Date();

  // Default range: a 2-month trailing window ending on the CURRENT
  // real-world month — so this is always live, never hardcoded.
  // e.g. if today is July 2026, defaults to "Jun – Jul 2026".
  const defaultTo: MonthYear = { month: now.getMonth(), year: now.getFullYear() };

  const fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const defaultFrom: MonthYear = { month: fromDate.getMonth(), year: fromDate.getFullYear() };

  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<MonthYear>(
    parseParam(searchParams.get("from"), defaultFrom)
  );
  const [to, setTo] = useState<MonthYear>(
    parseParam(searchParams.get("to"), defaultTo)
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const apply = () => {
    const fromParam = `${from.year}-${String(from.month + 1).padStart(2, "0")}`;
    const toParam = `${to.year}-${String(to.month + 1).padStart(2, "0")}`;
    router.push(`${pathname}?from=${fromParam}&to=${toParam}`);
    setOpen(false);
  };

  const yearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="bg-white rounded-full px-4 py-2 shadow-sm text-sm text-zinc-700 flex items-center gap-2 cursor-pointer"
      >
        <span>📅</span>
        {MONTHS[from.month].slice(0, 3)} – {MONTHS[to.month].slice(0, 3)} {to.year}
        <span className="text-zinc-400">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-72 bg-white rounded-lg shadow-xl p-4 text-sm text-zinc-900">
          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <label className="block text-xs text-zinc-500 mb-1">From</label>
              <select
                value={from.month}
                onChange={(e) => setFrom({ ...from, month: Number(e.target.value) })}
                className="border rounded px-2 py-1 w-full mb-1"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <select
                value={from.year}
                onChange={(e) => setFrom({ ...from, year: Number(e.target.value) })}
                className="border rounded px-2 py-1 w-full"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-xs text-zinc-500 mb-1">To</label>
              <select
                value={to.month}
                onChange={(e) => setTo({ ...to, month: Number(e.target.value) })}
                className="border rounded px-2 py-1 w-full mb-1"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <select
                value={to.year}
                onChange={(e) => setTo({ ...to, year: Number(e.target.value) })}
                className="border rounded px-2 py-1 w-full"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={apply}
            className="w-full rounded bg-green-800 text-white py-1.5 mt-1"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}