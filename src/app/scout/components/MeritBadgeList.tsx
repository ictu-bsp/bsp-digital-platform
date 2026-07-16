const items = [
  { id: 1, title: "First Aid", completed: true },
  { id: 2, title: "Cooking", completed: true },
  { id: 3, title: "Camping", completed: false },
  { id: 4, title: "Hiking", completed: false },
];

export default function MeritBadgeList() {
  return (
    <section className="px-1 pb-4">
      <div className="mb-4 text-center">
        <h3 className="text-xl font-semibold text-emerald-900">
          Required Merit Badges
        </h3>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const isCompleted = item.completed;
          const isLast = index === items.length - 1;

          return (
            <div key={item.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                    isCompleted
                      ? "border-emerald-800 bg-emerald-800"
                      : "border-gray-400 bg-white"
                  }`}
                >
                  {isCompleted ? (
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M5 12.5 9.5 17 19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </div>
                {!isLast ? (
                  <div
                    className={`mt-1 h-12 w-[2px] ${
                      isCompleted ? "bg-emerald-700" : "border-l border-dashed border-gray-400"
                    }`}
                  />
                ) : null}
              </div>

              <div className="min-h-[96px] flex-1 rounded-2xl bg-gray-200 px-4 py-3 shadow-sm">
                <p className="text-sm font-semibold text-emerald-950">{item.title}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {isCompleted ? "Completed and ready for review" : "Pending requirement"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
