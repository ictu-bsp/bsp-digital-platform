interface DashboardHeaderProps {
  userName: string;
  avatarUrl?: string | null;
}

export default function DashboardHeader({ userName, avatarUrl }: DashboardHeaderProps) {
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between px-4 pb-3 pt-5">
      <div>
        <p className="text-2xl font-black tracking-tight text-emerald-950">eScout</p>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-gray-600">Welcome, {userName}!</p>
        <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-emerald-700 bg-white text-sm font-bold text-emerald-900">
          {avatarUrl ? (
            <img src={avatarUrl} alt={`${userName}'s avatar`} className="h-full w-full rounded-full object-cover" />
          ) : (
            <span>{initial}</span>
          )}
        </div>
      </div>
    </header>
  );
}
