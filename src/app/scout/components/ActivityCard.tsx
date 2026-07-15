//src/app/scout/components/ActivityCard.tsx

interface ActivityCardProps {
  title: string;
  location: string;
  date: string;
  preview?: boolean;
}

export default function ActivityCard({
  title,
  location,
  date,
  preview = false,
}: ActivityCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        {preview && (
          <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
            Preview
          </span>
        )}
      </div>

      <p className="mt-2 text-sm text-slate-600">
        📍 {location}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {date}
      </p>
    </div>
  );
}