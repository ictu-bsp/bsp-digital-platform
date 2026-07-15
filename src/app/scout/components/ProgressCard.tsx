//src/app/scout/components/ProgressCard.tsx

interface ProgressCardProps {
  activity: string;
  progress: number;
}

export default function ProgressCard({
  activity,
  progress,
}: ProgressCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="font-semibold">
          {activity}
        </span>

        <span className="text-sm font-semibold text-green-700">
          {progress}%
        </span>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-green-700"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}