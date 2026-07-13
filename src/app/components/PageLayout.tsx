import React from "react";
import Header from "../scout/components/Header";
import BottomNav from "../scout/components/BottomNav";

interface PageLayoutProps {
  children: React.ReactNode;
  userName: string;
  avatarUrl?: string;
}

export default function PageLayout({ children, userName, avatarUrl }: PageLayoutProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#f7fdf8] to-[#e7f6ea] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <div className="flex-1 w-full pb-28">
          <Header userName={userName} avatarUrl={avatarUrl ?? undefined} />
          {children}
        </div>

        <BottomNav />
      </div>
    </main>
  );
}
