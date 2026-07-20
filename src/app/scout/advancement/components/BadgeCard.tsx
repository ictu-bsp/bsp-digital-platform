interface BadgeCardProps {
  label: string;
  isCompleted: boolean;
  subtitle?: string;
}

export default function BadgeCard({ label, isCompleted, subtitle }: BadgeCardProps) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-3 py-3 ${
        isCompleted
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-50 opacity-80"
      }`}
    >
      <div
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
          isCompleted ? "border-emerald-700 bg-emerald-700" : "border-slate-300 bg-slate-100"
        }`}
      >
        {isCompleted ? (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12.5 9.5 17 19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 7.5V6a4 4 0 0 1 8 0v1.5" strokeLinecap="round" />
            <rect x="6" y="7.5" width="12" height="10" rx="2" />
          </svg>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="mt-1 text-xs text-slate-500">
          {isCompleted ? "Completed" : "Locked / pending requirement"}
        </p>
        {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
      </div>
    </div>
  );
}
