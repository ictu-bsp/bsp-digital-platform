//src/app/scout/page.tsx

import { redirect } from "next/navigation";

import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import ActivitySection from "./components/ActivitySection";
import ProgressSection from "./components/ProgressSection";
import NotificationSection from "./components/NotificationSection";
import AnnouncementSection from "./components/AnnouncementSection";
import PromoCarousel, { PromoBanner, } from "./components/PromoCarousel";


import { getCurrentUser } from "@/lib/auth/current-user";

const promoBanners: PromoBanner[] = [
  {
    id: "banner-1",
    backgroundColor: "#daf5e7",
    linkUrl: "#",
    label: "",
  },
  {
    id: "banner-2",
    backgroundColor: "#e7f2df",
    linkUrl: "#",
    label: "",
  },
  {
    id: "banner-3",
    backgroundColor: "#d7f0fc",
    linkUrl: "#",
    label: "",
  },
  {
    id: "banner-4",
    backgroundColor: "#f1f8e7",
    linkUrl: "#",
    label: "",
  },
  {
    id: "banner-5",
    backgroundColor: "#e9f6ea",
    linkUrl: "#",
    label: "",
  },
];

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isScout =
    user.role === "SCOUT" ||
    user.role === "COUNCIL_ADMIN" ||
    user.role === "SUPER_ADMIN";

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#f7fdf8] to-[#e7f6ea] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">

        <div className="flex-1 pb-28">

          <Header
            userName={user.firstName}
            avatarUrl={user.avatarUrl}
          />

          <PromoCarousel
            banners={promoBanners}
          />

          <NotificationSection
            role={user.role}
          />

          <AnnouncementSection
            role={user.role}
          />

          <ActivitySection
            role={user.role}
          />

          {isScout && (
            <ProgressSection />
          )}

        </div>

        <BottomNav />

      </div>
    </main>
  );
}