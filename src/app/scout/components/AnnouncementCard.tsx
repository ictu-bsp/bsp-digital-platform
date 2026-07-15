//src/app/scout/components/AnnouncementCard.tsx

interface AnnouncementCardProps {
  title: string;
  body: string;
  author: string;
  date: string;
}

export default function AnnouncementCard({
  title,
  body,
  author,
  date,
}: AnnouncementCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="font-semibold text-green-900">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-600">
        {body}
      </p>

      <div className="mt-3 flex justify-between text-xs text-slate-500">
        <span>{author}</span>
        <span>{date}</span>
      </div>
    </div>
  );
}