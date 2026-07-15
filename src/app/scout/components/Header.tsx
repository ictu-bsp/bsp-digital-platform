//src/app/scout/components/Header.tsx

"use client";

import Link from "next/link";
import Image from "next/image";

interface HeaderProps {
  userName: string;
  avatarUrl?: string | null;
}

export default function Header({
  userName,
  avatarUrl,
}: HeaderProps) {
  const initial =
    userName.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between px-4 pt-6 pb-4">

      <Image
        src="/escout-logo.svg"
        alt="eScout Logo"
        width={115}
        height={115}
        className="h-auto w-[115px]"
        priority
      />

      <div className="flex items-center gap-3">

        <div className="text-right">
          <p className="text-sm text-gray-500">
            Welcome,
          </p>

          <p className="text-lg font-bold text-green-900">
            {userName}
          </p>
        </div>

        <Link
          href="/scout/profile"
          className="transition hover:opacity-80"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${userName}'s Avatar`}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-emerald-200"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-900 ring-2 ring-emerald-200">
              <span className="text-sm font-semibold">
                {initial}
              </span>
            </div>
          )}
        </Link>

      </div>

    </header>
  );
}