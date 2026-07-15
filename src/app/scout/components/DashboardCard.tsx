//src/app/acout/components/DashboardCard.tsx

"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  disabled?: boolean;
}

export default function DashboardCard({
  title,
  description,
  href,
  icon,
  disabled = false,
}: DashboardCardProps) {
  const content = (
    <div
      className={`
        rounded-2xl
        border
        bg-white
        p-5
        shadow-sm
        transition

        ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : "hover:-translate-y-1 hover:shadow-md"
        }
      `}
    >
      <div className="mb-3 text-green-800">
        {icon}
      </div>

      <h3 className="font-semibold">
        {title}
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>
    </div>
  );

  if (disabled) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}