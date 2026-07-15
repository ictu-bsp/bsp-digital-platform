//src/app/scout/components/NotificationCard.tsx

interface NotificationCardProps {
  title: string;
  description: string;
  date: string;
}

export default function NotificationCard({
  title,
  description,
  date,
}: NotificationCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        <span className="text-xs text-slate-500">
          {date}
        </span>
      </div>

      <p className="mt-2 text-sm text-slate-600">
        {description}
      </p>
    </div>
  );
}