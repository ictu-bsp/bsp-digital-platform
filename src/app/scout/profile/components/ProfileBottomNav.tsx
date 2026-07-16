//src/app/scout/profile/components/ProfileBottomNav.tsx

"use client";

import { useRouter } from "next/navigation";
import ProfileNavItem from "./ProfileNavItem";

interface ProfileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function ProfileBottomNav({
  activeTab,
  onTabChange,
}: ProfileBottomNavProps) {
  const router = useRouter();

  const navItems = [
    {
      key: "home",
      label: "Home",
      icon: (
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5.5V14H9.5v7H4a1 1 0 0 1-1-1v-9.5Z" />
        </svg>
      ),
    },
    {
      key: "membership",
      label: "Membership",
      icon: <img src="/MembershipID.svg" alt="" className="h-7 w-7" />,
    },
    {
      key: "advancement",
      label: "Advancement",
      icon: <img src="/Advancement.svg" alt="" className="h-7 w-7" />,
    },
    {
      key: "activities",
      label: "Activities",
      icon: <img src="/Activities.svg" alt="" className="h-7 w-7" />,
    },
  ];

  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    // Navigate to corresponding route
    switch (tab) {
      case "home":
        router.push("/scout");
        break;
      case "membership":
        router.push("/scout/membership");
        break;
      case "advancement":
        router.push("/scout/advancement");
        break;
      case "activities":
        router.push("/scout/activities/activity-1");
        break;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2">
        {navItems.map((item) => (
          <ProfileNavItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.key}
            onClick={() => handleTabChange(item.key)}
          />
        ))}
      </div>
    </nav>
  );
}
