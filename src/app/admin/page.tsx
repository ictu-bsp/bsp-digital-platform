// src/app/admin/page.tsx
// Admin dashboard home. Top two boxes show live stats from fetchDashboardStats.
// Bottom two boxes are placeholders — not yet scoped.

import { fetchDashboardStats } from "@/app/actions/admin";
import MonthRangePicker from "./components/MonthRangePicker";

export default async function AdminDashboardPage() {
  const result = await fetchDashboardStats();
  const stats = result.success ? result.data : null;

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

      {/* Wide box 1 — placeholder */}
      <div className="bg-white rounded-2xl shadow-sm p-6 min-h-[200px]">
        {/* Not yet scoped */}
      </div>

      {/* Wide box 2 — placeholder */}
      <div className="bg-white rounded-2xl shadow-sm p-6 min-h-[140px]">
        {/* Not yet scoped */}
      </div>
    </div>
  );
}