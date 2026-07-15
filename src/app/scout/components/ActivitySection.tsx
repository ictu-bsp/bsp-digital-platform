//src/app/scout/components/ActivitySection.tsx

import ActivityCard from "./ActivityCard";

interface Props {
  role: string;
}

export default function ActivitySection({
  role,
}: Props) {
  const preview = role === "VISITOR";

  return (
    <section className="px-4 pt-6">
      <h2 className="mb-3 text-lg font-bold text-slate-900">
        Upcoming Activities
      </h2>

      <div className="space-y-3">
        <ActivityCard
          title="Tree Planting"
          location="Laguna"
          date="July 20"
          preview={preview}
        />

        <ActivityCard
          title="Community Service"
          location="Calamba"
          date="July 26"
          preview={preview}
        />
      </div>
    </section>
  );
}