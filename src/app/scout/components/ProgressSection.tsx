//src/app/scout/components/ProgressSection.tsx

import ProgressCard from "./ProgressCard";

export default function ProgressSection() {
  return (
    <section className="px-4 py-6">
      <h2 className="mb-3 text-lg font-bold text-slate-900">
        Your Progress
      </h2>

      <div className="space-y-3">
        <ProgressCard
          activity="Camping Skills"
          progress={80}
        />

        <ProgressCard
          activity="Community Service"
          progress={35}
        />
      </div>
    </section>
  );
}