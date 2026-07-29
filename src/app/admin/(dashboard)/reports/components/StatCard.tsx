// src/app/admin/reports/components/StatCard.tsx
//
// Reusable shell for the admin reports page. Displays a title, an optional
// primary value, an optional note (e.g. data-limitation disclaimers), and
// arbitrary content (typically a ReportTable) via children.

type StatCardProps = {
  title: string;
  value?: string | number;
  valueLabel?: string; // e.g. "Total Applications"
  note?: string; // e.g. data limitation disclaimer
  children?: React.ReactNode;
};

export default function StatCard({
  title,
  value,
  valueLabel,
  note,
  children,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 text-zinc-900 flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-green-800">{title}</h3>

      {value !== undefined && (
        <div>
          <p className="text-3xl font-bold">{value}</p>
          {valueLabel && <p className="text-sm text-zinc-500">{valueLabel}</p>}
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