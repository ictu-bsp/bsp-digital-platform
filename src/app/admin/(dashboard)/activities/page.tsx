// src/app/admin/(dashboard)/activities/page.tsx
// Registrar/Activities admin page: lists every activity (published and
// unpublished) and lets authorized roles post new ones.
// Server component — fetches the full activity list once on load, then
// hands it to the client-side table/form component.

import { getActivitiesAction } from "@/app/actions/activities";
import { getCouncilsAction, getRegionsAction } from "@/app/actions/councils";
import ActivitiesTable from "./ActivitiesTable";

export default async function ActivitiesPage() {
  const result = await getActivitiesAction();
  const councilsResult = await getCouncilsAction();
  const regionsResult = await getRegionsAction();

  if (!result.success || !result.data) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <p className="text-red-600">
          {result.error ?? "Failed to load activities."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-green-800">Activities</h1>
        <p className="text-sm text-zinc-500">
          Post new Scouting activities and manage existing ones. Activities
          become visible to scouts once published.
        </p>
      </div>

      <ActivitiesTable
        initialActivities={result.data}
        councils={councilsResult.success ? councilsResult.data ?? [] : []}
        regions={regionsResult.success ? regionsResult.data ?? [] : []}
      />
    </div>
  );
}