// src/app/scout/components/LockedDashboardCard.tsx

import Link from "next/link";
import { Lock } from "lucide-react";

interface LockedDashboardCardProps {
  title: string;
  description: string;
  href?: string;
}

export default function LockedDashboardCard({
  title,
  description,
  href = "/scout/membership",
}: LockedDashboardCardProps) {
  return (
    <Link
      href={href}
      className="group block"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">

        <div className="mb-3 flex items-center justify-between">
          <Lock
            size={20}
            className="text-green-800"
          />

          <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-bold uppercase text-green-800">
            Locked
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900">
          {title}
        </h3>

        <p className="mt-2 text-sm text-slate-600">
          {description}
        </p>

        <p className="mt-4 text-sm font-semibold text-green-800 group-hover:underline">
          Become a Scout →
        </p>

      </div>
    </Link>
  );
}