"use client";

import Link from "next/link";

interface HeaderProps {
  userName: string;
  avatarUrl?: string;
}

export default function Header({ userName, avatarUrl }: HeaderProps) {
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between px-4 pt-6 pb-4">
      <p className="text-5xl font-bold text-green-900">
        eScout
      </p>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-2xl font-bold text-green-900">Hello, {userName}</p>
        </div>
        <Link href="/profile" className="transition hover:opacity-80">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${userName} avatar`}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-100"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-900 shadow-sm hover:bg-emerald-200">
              <span className="text-lg font-semibold">{initial}</span>
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
