import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import RankCarousel from './components/RankCarousel';
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function AdvancementPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const canViewAdvancement =
  user.role === "SCOUT" ||
  user.role === "COUNCIL_ADMIN" ||
  user.role === "SUPER_ADMIN";

  if (!canViewAdvancement) {
    redirect("/scout/membership");
  }

  const ranks = [
    { id: "senior", name: "Senior Scout", imageSrc: "/seniorscout.svg", badgeType: "Advancement", unlocked: true },
    { id: "explorer", name: "Explorer", imageSrc: "/Explorer.svg", badgeType: "Advancement", unlocked: true },
    { id: "pathfinder", name: "Pathfinder", imageSrc: "/Pathfinder.svg", badgeType: "Advancement", unlocked: false },
    { id: "outdoorsman", name: "Outdoorsman", imageSrc: "/Outdoorsman.svg", badgeType: "Advancement", unlocked: false },
    { id: "venturer", name: "Venturer", imageSrc: "/Venturer.svg", badgeType: "Advancement", unlocked: false },
    { id: "eagle", name: "Eagle Scout", imageSrc: "/EagleScout.svg", badgeType: "Advancement", unlocked: false },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#f7fdf8] to-[#e7f6ea] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <div className="flex-1 pb-28">
          <Header userName={user.firstName} avatarUrl={user.avatarUrl ?? undefined} />

          <div className="space-y-5 px-4 py-4 sm:px-5">
            <RankCarousel ranks={ranks} activeRankId="explorer" />
          </div>
        </div>

        <BottomNav />
      </div>
    </main>
  );
}
