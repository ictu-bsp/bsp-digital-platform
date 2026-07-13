"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface HeaderProps {
  userName: string;
  avatarUrl?: string;
}

export default function Header({ userName }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between px-4 pt-6 pb-4">
      <Image
        src="/escout-logo.svg"
        alt="Verification pending"
        width={115}
        height={115}
        className="inline-block"
      />

      <button
        type="button"
        onClick={() => router.push("/login")}
        className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
      >
        Log out
      </button>
    </header>
  );
}
