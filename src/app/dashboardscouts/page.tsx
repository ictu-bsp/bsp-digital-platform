import Header from "@/components/Header";
import PromoCarousel, { PromoBanner } from "@/components/PromoCarousel";
import DashboardGrid from "@/components/DashboardGrid";
import BottomNav from "@/components/BottomNav";

const user = {
  userName: "Juan",
  userAvatarUrl: null,
};

const promoBanners: PromoBanner[] = [
  { id: "banner-1", backgroundColor: "#daf5e7", linkUrl: "/dashboard?promo=1", label: "" },
  { id: "banner-2", backgroundColor: "#e7f2df", linkUrl: "/dashboard?promo=2", label: "" },
  { id: "banner-3", backgroundColor: "#d7f0fc", linkUrl: "/dashboard?promo=3", label: "" },
  { id: "banner-4", backgroundColor: "#f1f8e7", linkUrl: "/dashboard?promo=4", label: "" },
  { id: "banner-5", backgroundColor: "#e9f6ea", linkUrl: "/dashboard?promo=5", label: "" },
  { id: "banner-6", backgroundColor: "#dff4f9", linkUrl: "/dashboard?promo=6", label: "" },
  { id: "banner-7", backgroundColor: "#e8f8ea", linkUrl: "/dashboard?promo=7", label: "" },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-between">
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
