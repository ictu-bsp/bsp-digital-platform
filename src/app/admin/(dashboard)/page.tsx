// src/app/admin/page.tsx
// Admin dashboard home. Top two boxes show live stats from fetchDashboardStats.
// Bottom two boxes are placeholders — not yet scoped.

import {
  fetchDashboardStats,
  fetchSexBreakdown,
  fetchRegistrationStatusBreakdown,
  fetchScoutRankBreakdown,
  fetchCouncilRegionBreakdown,
} from "@/app/actions/admin";
import MonthRangePicker from "./components/MonthRangePicker";

export default async function AdminDashboardPage() {
  const result = await fetchDashboardStats();
  const stats = result.success ? result.data : null;

  const sexResult = await fetchSexBreakdown();
  const sexBreakdown = sexResult.success ? sexResult.data ?? [] : [];

  const statusResult = await fetchRegistrationStatusBreakdown();
  const statusBreakdown = statusResult.success ? statusResult.data ?? [] : [];

  const rankResult = await fetchScoutRankBreakdown();
  const rankBreakdown = rankResult.success ? rankResult.data ?? [] : [];

  const regionResult = await fetchCouncilRegionBreakdown();
  const regionBreakdown = regionResult.success
    ? regionResult.data?.regionCounts ?? []
    : [];

  const totalScoutsForBars = stats?.totalScouts || 1; // avoid divide-by-zero in bar widths

  return (
    <div className="flex flex-col gap-4">
      {/* Date range control */}
      <div className="flex justify-end">
        <MonthRangePicker />
      </div>

      {/* Top stat boxes */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 min-h-[140px]">
          <p className="text-sm text-zinc-500 mb-1">Total Scouts</p>
          <p className="text-3xl font-bold text-green-800">
            {stats ? stats.totalScouts : "—"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 min-h-[140px]">
          <p className="text-sm text-zinc-500 mb-1">Total Councils</p>
          <p className="text-3xl font-bold text-green-800">
            {stats ? stats.totalCouncils : "—"}
          </p>
        </div>
      </div>

      {/* Wide box 1 — Scout Demographics + Registration Status */}
      <div className="bg-white rounded-2xl shadow-sm p-6 min-h-[200px]">
        <h2 className="text-lg font-bold text-green-800 mb-4">Analytics</h2>

        <div className="grid grid-cols-2 gap-6">
          {/* Sex breakdown */}
          <div>
            <p className="text-sm font-semibold text-zinc-600 mb-2">
              Scouts by Sex
            </p>
            <div className="flex flex-col gap-2">
              {sexBreakdown.length === 0 && (
                <p className="text-sm text-zinc-400">No data available.</p>
              )}
              {sexBreakdown.map((row) => (
                <div key={row.sex ?? "unspecified"}>
                  <div className="flex justify-between text-sm text-zinc-700 mb-1">
                    <span>{row.sex ?? "Unspecified"}</span>
                    <span className="font-semibold">{row.value}</span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-2">
                    <div
                      className="bg-green-800 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (row.value / totalScoutsForBars) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Registration status breakdown */}
          <div>
            <p className="text-sm font-semibold text-zinc-600 mb-2">
              Registrations by Status
            </p>
            <div className="flex flex-col gap-2">
              {statusBreakdown.length === 0 && (
                <p className="text-sm text-zinc-400">No data available.</p>
              )}
              {statusBreakdown.map((row) => (
                <div key={row.status} className="flex justify-between text-sm text-zinc-700">
                  <span className="capitalize">{row.status.replace("_", " ")}</span>
                  <span className="font-semibold">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wide box 2 — Scout Rank + Region Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm p-6 min-h-[140px]">
        <h2 className="text-lg font-bold text-green-800 mb-4">
          Scout Distribution
        </h2>

        <div className="grid grid-cols-2 gap-6">
          {/* Rank breakdown */}
          <div>
            <p className="text-sm font-semibold text-zinc-600 mb-2">
              By Scout Type / Rank
            </p>
            <div className="flex flex-col gap-1">
              {rankBreakdown.length === 0 && (
                <p className="text-sm text-zinc-400">No data available.</p>
              )}
              {rankBreakdown.map((row) => (
                <div key={row.rank} className="flex justify-between text-sm text-zinc-700">
                  <span>{row.rank}</span>
                  <span className="font-semibold">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Region breakdown */}
          <div>
            <p className="text-sm font-semibold text-zinc-600 mb-2">
              By Region
            </p>
            <div className="flex flex-col gap-1">
              {regionBreakdown.length === 0 && (
                <p className="text-sm text-zinc-400">No data available.</p>
              )}
              {regionBreakdown.map((row) => (
                <div key={row.region} className="flex justify-between text-sm text-zinc-700">
                  <span>{row.region}</span>
                  <span className="font-semibold">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}