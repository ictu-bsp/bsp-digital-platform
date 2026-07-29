// src/app/admin/scout-roster/page.tsx
import { getScoutRosterAction } from "@/app/actions/scouts";
import { ScoutRosterTable } from "./ScoutRosterTable";
import { requireAdminPage } from "@/lib/auth/require-admin";
// Fetch and display the admin scout roster on the server side.
export default async function ScoutRosterPage() {
  await requireAdminPage(["CHIEF_EXECUTIVE", "MEMBERSHIP_OFFICER", "ACTIVITIES_OFFICER", "REGISTRAR"]);
  const result = await getScoutRosterAction();
  if (!result.success || !result.data) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <p className="text-red-600">{result.error ?? "Failed to load scout roster."}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-green-800">Scout Roster</h1>
        <p className="text-sm text-zinc-500">
          All scouts who have logged in and applied for membership. Use the toggle to activate or revoke a membership for testing.
        </p>
      </div>
      <ScoutRosterTable initialRoster={result.data} />
    </div>
  );
}