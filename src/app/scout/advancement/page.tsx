import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import RankSelector from '../components/RankSelector';
import MeritBadgeList from '../components/MeritBadgeList';
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#f7fdf8] to-[#e7f6ea] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <div className="flex-1 pb-28">
          <Header userName={user.firstName} avatarUrl={user.avatarUrl ?? undefined} />

          <div className="space-y-5 px-4 py-4 sm:px-5">
            <RankSelector />
            <MeritBadgeList />
          </div>
        </div>

        <BottomNav />
      </div>
    </main>
  );
}
