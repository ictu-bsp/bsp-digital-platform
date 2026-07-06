"use client";

import { useState } from "react";

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: Array<NavItem> = [
  {
    key: "home",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5.5V14H9.5v7H4a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    ),
  },
  {
    key: "membership",
    label: "Membership",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="5" width="16" height="14" rx="3" />
        <path d="M9 9h6M9 13h6" />
      </svg>
    ),
  },
  {
    key: "advancement",
    label: "Advancement",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3l3 6 6 .5-4.5 4 1.5 6-5.5-3.5L6 19l1.5-6L3 9.5 9 9l3-6Z" />
      </svg>
    ),
  },
  {
    key: "activities",
    label: "Activities",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 17h16M6 17l6-11 6 11M10 13h4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveTab("home")}
          className="flex flex-col items-center gap-1 text-[0.72rem]"
        >
          <span className={activeTab === "home" ? "text-green-900" : "text-gray-400"}>
            {navItems[0].icon}
          </span>
          <span className={activeTab === "home" ? "text-green-900 font-semibold" : "text-gray-400"}>
            Home
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("membership")}
          className="flex flex-col items-center gap-1 text-[0.72rem]"
        >
          <span className={activeTab === "membership" ? "text-green-900" : "text-gray-400"}>
            {navItems[1].icon}
          </span>
          <span className={activeTab === "membership" ? "text-green-900 font-semibold" : "text-gray-400"}>
            Membership
          </span>
        </button>

        <div className="relative flex h-16 w-16 items-center justify-center">
          <button
            type="button"
            onClick={() => setActiveTab("membershipId")}
            className="absolute -top-7 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900 text-white shadow-[0_15px_30px_-18px_rgba(16,185,129,0.8)] transition"
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 7h12M6 12h12M6 17h12" />
              <path d="M9 7v10" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab("advancement")}
          className="flex flex-col items-center gap-1 text-[0.72rem]"
        >
          <span className={activeTab === "advancement" ? "text-green-900" : "text-gray-400"}>
            {navItems[2].icon}
          </span>
          <span className={activeTab === "advancement" ? "text-green-900 font-semibold" : "text-gray-400"}>
            Advancement
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("activities")}
          className="flex flex-col items-center gap-1 text-[0.72rem]"
        >
          <span className={activeTab === "activities" ? "text-green-900" : "text-gray-400"}>
            {navItems[3].icon}
          </span>
          <span className={activeTab === "activities" ? "text-green-900 font-semibold" : "text-gray-400"}>
            Activities
          </span>
        </button>
      </div>
    </nav>
  );
}
