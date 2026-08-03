import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import RankCarousel from './components/RankCarousel';
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getScoutByUserId } from "@/services/scout.service";
import { getAdvancementRanksForSection } from "@/lib/utils/scout-advancement-rank";
import { SECTION_LABELS, type ScoutSection } from "@/lib/utils/scout-section";

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

  const scout = user.id ? await getScoutByUserId(user.id) : null;
  const section = (scout?.section as ScoutSection | undefined) ?? "BOY";
  const currentAdvancementRank = (scout?.advancementRank as string | null) ?? null;
  const rankOptions = getAdvancementRanksForSection(section);

  const ranks = rankOptions.length
    ? rankOptions.map((option, index) => ({
        id: option.value.toLowerCase().replace(/_/g, "-"),
        name: option.label,
        imageSrc: ["/Explorer.svg", "/Pathfinder.svg", "/Outdoorsman.svg", "/Venturer.svg", "/EagleScout.svg"][index] ?? "/Explorer.svg",
        badgeType: index === 0 ? "Current rank" : index === rankOptions.length - 1 ? "Final milestone" : "Next milestone",
        unlocked: currentAdvancementRank ? index <= rankOptions.findIndex((item) => item.value === currentAdvancementRank) : index === 0,
      }))
    : [{ id: "section", name: SECTION_LABELS[section], imageSrc: "/Explorer.svg", badgeType: "Section", unlocked: true }];

  const activeRankId = currentAdvancementRank
    ? currentAdvancementRank.toLowerCase().replace(/_/g, "-")
    : ranks[0]?.id ?? "section";

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#f7fdf8] to-[#e7f6ea] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <div className="flex-1 pb-28">
          <Header userName={user.firstName} avatarUrl={user.avatarUrl ?? undefined} />

          <div className="space-y-5 px-4 py-4 sm:px-5">
            <RankCarousel ranks={ranks} activeRankId={activeRankId} sectionLabel={SECTION_LABELS[section]} />
          </div>
        </div>

        <BottomNav />
      </div>
    </main>
  );
}
