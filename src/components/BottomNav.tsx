"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: Array<NavItem> = [
  {
    key: "home",
    label: "Home",
    href: "/dashboardscouts",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5.5V14H9.5v7H4a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    ),
  },
  {
    key: "membership",
    label: "Membership",
    href: "/dashboardscouts/membership",
    icon: <img src="/MembershipID.svg" alt="" className="h-7 w-7" />,
  },
  {
    key: "advancement",
    label: "Advancement",
    href: "/dashboardscouts/advancement",
    icon: <img src="/Advancement.svg" alt="" className="h-7 w-7" />,
  },
  {
    key: "activities",
    label: "Activities",
    href: "/dashboardscouts/activities",
    icon: <img src="/Activities.svg" alt="" className="h-7 w-7" />,
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const activeTab = pathname?.includes("/membership")
    ? "membership"
    : pathname?.includes("/advancement")
      ? "advancement"
      : pathname?.includes("/activities")
        ? "activities"
        : "home";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;

          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 text-[0.72rem]"
            >
              <span className={isActive ? "text-green-900" : "text-gray-400"}>{item.icon}</span>
              <span
                className={isActive ? "text-center text-[0.72rem] font-semibold text-green-900" : "text-center text-[0.72rem] text-gray-400"}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
