// src/app/admin/(dashboard)/announcements/page.tsx
import { getAnnouncementsForAdminAction } from "@/app/actions/announcements";
import { getCouncilsAction, getRegionsAction } from "@/app/actions/councils";
import { requireAdminPage } from "@/lib/auth/require-admin";
import AnnouncementsTable from "./AnnouncementsTable";

export default async function AnnouncementsPage() {
  // Matches the "Announcement Hub" menu item's role list in admin-menu.ts.
  const { scope } = await requireAdminPage(["CHIEF_EXECUTIVE"]);

  const [result, councilsResult, regionsResult] = await Promise.all([
    getAnnouncementsForAdminAction(),
    getCouncilsAction(),
    getRegionsAction(),
  ]);

  if (!result.success || !result.data) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <p className="text-red-600">{result.error ?? "Failed to load announcements."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-green-800">Announcement Hub</h1>
        <p className="text-sm text-zinc-500">
          Post announcements for scouts. Visibility is scoped to your own council/region automatically.
        </p>
      </div>
      <AnnouncementsTable
        initialAnnouncements={result.data}
        councils={councilsResult.success ? councilsResult.data ?? [] : []}
        regions={regionsResult.success ? regionsResult.data ?? [] : []}
        scope={scope}
      />
    </div>
  );
}
