import Header from "../scout/components/Header";
import PromoCarousel, { PromoBanner } from "../scout/components/PromoCarousel";
import DashboardGrid from "../scout/components/DashboardGrid";
import BottomNav from "../scout/components/BottomNav";

const user = {
  userName: "Juan",
  userAvatarUrl: null,
};

const promoBanners: PromoBanner[] = [
  { id: "banner-1", backgroundColor: "#daf5e7", linkUrl: "/scout?promo=1", label: "" },
  { id: "banner-2", backgroundColor: "#e7f2df", linkUrl: "/scout?promo=2", label: "" },
  { id: "banner-3", backgroundColor: "#d7f0fc", linkUrl: "/scout?promo=3", label: "" },
  { id: "banner-4", backgroundColor: "#f1f8e7", linkUrl: "/scout?promo=4", label: "" },
  { id: "banner-5", backgroundColor: "#e9f6ea", linkUrl: "/scout?promo=5", label: "" },
  { id: "banner-6", backgroundColor: "#dff4f9", linkUrl: "/scout?promo=6", label: "" },
  { id: "banner-7", backgroundColor: "#e8f8ea", linkUrl: "/scout?promo=7", label: "" },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#f7fdf8] to-[#e7f6ea] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <div className="flex-1 w-full pb-28">
          <Header userName={user.userName} avatarUrl={user.userAvatarUrl ?? undefined} />
          <PromoCarousel banners={promoBanners} />
          <DashboardGrid />
        </div>

        <BottomNav />
      </div>
    </main>
  );
}
