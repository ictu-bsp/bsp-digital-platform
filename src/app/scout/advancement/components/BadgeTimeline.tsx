import BadgeCard from "./BadgeCard";

export interface MeritBadgeItem {
  id: string;
  name: string;
  isCompleted: boolean;
  note?: string;
}

interface BadgeTimelineProps {
  badges: MeritBadgeItem[];
}

export default function BadgeTimeline({ badges }: BadgeTimelineProps) {
  return (
    <section className="rounded-[1.75rem] border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-emerald-700">Required achievements</p>
          <h3 className="mt-1 text-lg font-bold text-emerald-950">Progress checklist</h3>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
          {badges.filter((badge) => badge.isCompleted).length}/{badges.length}
        </div>
      </div>

      <div className="space-y-3">
        {badges.map((badge, index) => {
          const isCompleted = badge.isCompleted;
          const isLast = index === badges.length - 1;

          return (
            <div key={badge.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${isCompleted ? "border-emerald-700 bg-emerald-700" : "border-slate-300 bg-white"}`}>
                  {isCompleted ? (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12.5 9.5 17 19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </div>
                {!isLast ? <div className={`mt-1 h-10 w-[2px] ${isCompleted ? "bg-emerald-700" : "border-l border-dashed border-slate-300"}`} /> : null}
              </div>

              <div className="flex-1">
                <BadgeCard label={badge.name} isCompleted={isCompleted} subtitle={badge.note} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
