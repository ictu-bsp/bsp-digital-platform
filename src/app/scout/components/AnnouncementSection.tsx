//src/app/scout/components/AnnouncementSection.tsx

import AnnouncementCard from "./AnnouncementCard";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  visibility: "PUBLIC" | "SCOUTS" | "COUNCIL" | "REGIONAL";
  author: { firstName: string; lastName: string } | null;
  council: { name: string } | null;
  region: { name: string } | null;
}

interface Props {
  announcements: AnnouncementItem[];
}

function authorLabel(item: AnnouncementItem): string {
  if (item.visibility === "COUNCIL" && item.council) {
    return item.council.name;
  }
  if (item.visibility === "REGIONAL" && item.region) {
    return item.region.name;
  }
  if (item.author) {
    return `${item.author.firstName} ${item.author.lastName}`;
  }
  return "BSP National";
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
  });
}

export default function AnnouncementSection({
  announcements,
}: Props) {
  return (
    <section className="px-4 pt-6">
      <h2 className="mb-3 text-lg font-bold text-slate-900">
        Latest Announcements
      </h2>

      <div className="space-y-3">
        {announcements.length === 0 ? (
          <p className="text-sm text-slate-500">
            No announcements yet.
          </p>
        ) : (
          announcements.map((item) => (
            <AnnouncementCard
              key={item.id}
              title={item.title}
              body={item.content}
              author={authorLabel(item)}
              date={formatDate(item.createdAt)}
            />
          ))
        )}
      </div>
    </section>
  );
}
