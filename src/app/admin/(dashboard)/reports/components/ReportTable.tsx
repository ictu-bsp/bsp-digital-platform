// src/app/admin/(dashbaord)/reports/components/ReportTable.tsx
"use client";

import { useState } from "react";

type Column<T> = {
  header: string;
  accessor: (row: T) => React.ReactNode;
  align?: "left" | "right";
};

type ReportTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  maxHeightPx?: number; // collapsed scroll height before "Show all" kicks in
  emptyMessage?: string;
};

export default function ReportTable<T>({
  columns,
  rows,
  maxHeightPx = 260,
  emptyMessage = "No data available.",
}: ReportTableProps<T>) {
  const [expanded, setExpanded] = useState(false);

  if (rows.length === 0) {
    return <p className="text-sm text-zinc-500">{emptyMessage}</p>;
  }

  const needsToggle = rows.length > 6;

  return (
    <div>
      <div
        className="overflow-y-auto overflow-x-auto rounded-lg border border-zinc-100"
        style={{ maxHeight: expanded ? "none" : `${maxHeightPx}px` }}
      >
        <table className="w-full text-sm text-left border-collapse">
          <thead className="sticky top-0 bg-zinc-50 z-10">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.header}
                  className={`py-2 px-3 font-medium text-zinc-600 border-b border-zinc-200 whitespace-nowrap ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-zinc-100 last:border-0">
                {columns.map((col) => (
                  <td
                    key={col.header}
                    className={`py-2 px-3 text-zinc-800 ${
                      col.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {needsToggle && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-green-800 text-xs font-medium underline mt-2"
        >
          {expanded ? "Show less" : `Show all ${rows.length} rows`}
        </button>
      )}
    </div>
  );
}