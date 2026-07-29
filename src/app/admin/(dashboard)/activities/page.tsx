// src/app/admin/(dashboard)/activities/page.tsx
import { getActivitiesAction } from "@/app/actions/activities";
import { getCouncilsAction, getRegionsAction } from "@/app/actions/councils";
import { requireAdminPage } from "@/lib/auth/require-admin";
import ActivitiesTable from "./ActivitiesTable";

// Fetch initial activity, council, and region data concurrently and render the activity management dashboard.
export default async function ActivitiesPage() {
  // Matches the "Activities" menu item's role list in admin-menu.ts --
  // the sidebar already hides this link from other roles, this closes
  // the gap where someone could still reach it by typing the URL directly.
  const { scope } = await requireAdminPage(["CHIEF_EXECUTIVE", "REGISTRAR", "ACTIVITIES_OFFICER"]);

  const [result, councilsResult, regionsResult] = await Promise.all([
    getActivitiesAction(),
    getCouncilsAction(),
    getRegionsAction(),
  ]);

  if (!result.success || !result.data) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <p className="text-red-600">{result.error ?? "Failed to load activities."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-green-800">Activities</h1>
        <p className="text-sm text-zinc-500">
          Post new Scouting activities and manage existing ones. Activities become visible to scouts once published.
        </p>
      </div>
      <ActivitiesTable
        initialActivities={result.data}
        councils={councilsResult.success ? councilsResult.data ?? [] : []}
        regions={regionsResult.success ? regionsResult.data ?? [] : []}
        scope={scope}
      />
    </div>
  );
}
