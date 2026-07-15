//src/app/scout/components/AnnouncementSection.tsx

import AnnouncementCard from "./AnnouncementCard";

interface Props {
  role: string;
}

export default function AnnouncementSection({
  role,
}: Props) {
  return (
    <section className="px-4 pt-6">
      <h2 className="mb-3 text-lg font-bold text-slate-900">
        Latest Announcements
      </h2>

      <div className="space-y-3">
        <AnnouncementCard
          title="National Jamboree 2027"
          body="Registration for the upcoming National Jamboree is now open."
          author="BSP National"
          date="July 15"
        />

        {role !== "VISITOR" && (
          <AnnouncementCard
            title="Council Meeting"
            body="Monthly council meeting this Saturday."
            author="Laguna Council"
            date="July 14"
          />
        )}
      </div>
    </section>
  );
}