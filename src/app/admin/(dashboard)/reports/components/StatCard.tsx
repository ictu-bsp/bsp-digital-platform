// src/app/admin/reports/components/StatCard.tsx
//
// Reusable card for the admin reports page. Displays a title, a primary
// value, an optional note (e.g. data-limitation disclaimers), and an
// optional breakdown list (e.g. counts grouped by status/council/etc.).

type BreakdownRow = {
  label: string;
  value: string | number;
};

type StatCardProps = {
  title: string;
  value?: string | number;
  valueLabel?: string; // e.g. "Total Applications"
  breakdown?: BreakdownRow[];
  breakdownLabel?: string; // e.g. "By Status"
  note?: string; // e.g. data limitation disclaimer
  children?: React.ReactNode; // for custom content (charts, tables, etc.)
};

export default function StatCard({
  title,
  value,
  valueLabel,
  breakdown,
  breakdownLabel,
  note,
  children,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 text-zinc-900 flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-green-800">{title}</h3>

      {value !== undefined && (
        <div>
          <p className="text-3xl font-bold">{value}</p>
          {valueLabel && (
            <p className="text-sm text-zinc-500">{valueLabel}</p>
          )}
        </div>
      )}

      {breakdown && breakdown.length > 0 && (
        <div>
          {breakdownLabel && (
            <p className="text-sm font-medium text-zinc-700 mb-2">
              {breakdownLabel}
            </p>
          )}
          <ul className="flex flex-col gap-1.5">
            {breakdown.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between text-sm border-b border-zinc-100 pb-1.5 last:border-0"
              >
                <span className="text-zinc-600">{row.label}</span>
                <span className="font-medium text-zinc-900">{row.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {children}

      {note && (
        <p className="text-xs text-zinc-400 italic border-t border-zinc-100 pt-2">
          {note}
        </p>
      )}
    </div>
  );
}