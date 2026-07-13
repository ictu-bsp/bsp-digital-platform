export default function AdvancementProgress() {
  const currentRank = "Senior Scout";
  const nextRank = "Explorer";

  const completedRequirements = 48;
  const totalRequirements = 112;

  const completedBadges = 12;
  const totalBadges = 20;

  const progress = Math.round(
    (completedRequirements / totalRequirements) * 100
  );

  return (
    <section className="rounded-3xl border border-green-100 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-xs uppercase tracking-widest text-green-700 font-semibold">
            Current Rank
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {currentRank}
          </h2>
        </div>

        <div className="rounded-full bg-green-100 px-4 py-2">
          <span className="font-bold text-green-700">
            {progress}%
          </span>
        </div>

      </div>

      <div className="mt-5">

        <div className="h-3 overflow-hidden rounded-full bg-slate-200">

          <div
            className="h-full rounded-full bg-green-700 transition-all"
            style={{ width: `${progress}%` }}
          />

        </div>

      </div>

      <div className="mt-2 flex justify-between text-sm text-slate-600">

        <span>
          {completedRequirements} / {totalRequirements} Requirements
        </span>

        <span>
          {totalRequirements - completedRequirements} Remaining
        </span>

      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">

        <div className="rounded-2xl bg-green-50 p-4">

          <p className="text-xs uppercase tracking-wide text-green-700">
            Merit Badges
          </p>

          <p className="mt-1 text-xl font-bold">
            {completedBadges} / {totalBadges}
          </p>

        </div>

        <div className="rounded-2xl bg-green-50 p-4">

          <p className="text-xs uppercase tracking-wide text-green-700">
            Next Rank
          </p>

          <p className="mt-1 text-xl font-bold">
            {nextRank}
          </p>

        </div>

      </div>

      <button
        className="mt-6 w-full rounded-2xl bg-green-800 py-3 font-semibold text-white transition hover:bg-green-700"
      >
        View Requirements
      </button>

    </section>
  );
}