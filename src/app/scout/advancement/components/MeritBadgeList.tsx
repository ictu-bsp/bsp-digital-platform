type RankDetails = {
  title: string;
  unlocked: boolean;
  meritBadges: Array<{ title: string; completed: boolean; note: string }>;
  requirements: Array<{ title: string; completed: boolean }>;
};

type MeritBadgeListProps = {
  rank?: Partial<RankDetails> | null;
};

export default function MeritBadgeList({ rank }: MeritBadgeListProps) {
  const safeRank: RankDetails = {
    title: "Select a rank",
    unlocked: false,
    meritBadges: [],
    requirements: [],
    ...rank,
  };

  return (
    <section className="rounded-[1.5rem] border border-emerald-100 bg-white/80 p-4 shadow-sm">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold text-emerald-900">Required achievements</h3>
        <p className="mt-1 text-sm text-slate-600">
          {safeRank.title} is the current rank. Unlock the next stage by completing the requirements below.
        </p>
      </div>

      <div className="space-y-3">
        {safeRank.meritBadges.map((item, index) => {
          const isCompleted = item.completed;
          const isLast = index === safeRank.meritBadges.length - 1;

          return (
            <div key={item.title} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    isCompleted ? "border-emerald-800 bg-emerald-800" : "border-gray-400 bg-white"
                  }`}
                >
                  {isCompleted ? (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12.5 9.5 17 19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </div>
                {!isLast ? <div className={`mt-1 h-12 w-[2px] ${isCompleted ? "bg-emerald-700" : "border-l border-dashed border-gray-400"}`} /> : null}
              </div>

              <div className="min-h-[96px] flex-1 rounded-2xl bg-gray-100 px-4 py-3 shadow-sm">
                <p className="text-sm font-semibold text-emerald-950">{item.title}</p>
                <p className="mt-1 text-sm text-gray-600">{item.note}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl bg-emerald-50 p-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-emerald-900">Current and next requirements</h4>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${safeRank.unlocked ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"}`}>
            {safeRank.unlocked ? "Ready to review" : "Locked"}
          </span>
        </div>

        <ul className="mt-3 space-y-2">
          {safeRank.requirements.map((step) => (
            <li key={step.title} className="flex items-start gap-2 rounded-xl bg-white/70 px-3 py-2">
              <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${step.completed ? "bg-emerald-700" : "bg-slate-300"}`} />
              <div>
                <p className="text-sm font-medium text-slate-800">{step.title}</p>
                <p className="text-xs text-slate-500">{step.completed ? "Finished" : "Needed to unlock the next rank"}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
