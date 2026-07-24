// src/app/admin/reports/components/ReportsView.tsx
"use client";

import { useEffect, useState } from "react";
import StatCard from "./StatCard";
import { generateReportsPdf } from "../lib/generateReportsPdf";

type RegistrationSummary = {
  byStatus: { status: string; count: number }[];
  total: number;
};

type PaymentCollections = {
  byStatus: { paymentStatus: string; count: number; estimatedAmount: number }[];
  totalEstimatedAmount: number;
  note: string;
};

type RegionCouncilRow = {
  regionName: string | null;
  councilName: string;
  count: number;
};

type OverTimeRow = {
  month: string;
  count: number;
};

type RevenueByTenureRow = {
  registrationYears: number;
  count: number;
  estimatedRevenue: number;
};

type ActivitySummaryRow = {
  activityId: string;
  title: string;
  category: string;
  startDate: string;
  endDate: string | null;
  location: string;
  maxParticipants: number | null;
  isPublished: boolean;
  enrolledCount: number;
};

type AllReports = {
  registrationSummary: RegistrationSummary;
  paymentCollections: PaymentCollections;
  registrationsByRegionCouncil: RegionCouncilRow[];
  registrationsOverTime: OverTimeRow[];
  revenueByTenure: RevenueByTenureRow[];
  activitiesSummary: ActivitySummaryRow[];
};

type Enrollee = {
  registrationId: string;
  registeredAt: string;
  remarks: string | null;
  scoutId: string;
  membershipNumber: string | null;
  rank: string;
  scoutStatus: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  gender: string;
  birthdate: string;
};

export default function ReportsView() {
  const [reports, setReports] = useState<AllReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedActivity, setSelectedActivity] = useState<ActivitySummaryRow | null>(null);
  const [enrollees, setEnrollees] = useState<Enrollee[]>([]);
  const [enrolleesLoading, setEnrolleesLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch("/api/admin/reports");
        if (!res.ok) {
          throw new Error(`Failed to load reports (status ${res.status})`);
        }
        const data: AllReports = await res.json();
        setReports(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load reports. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const onViewEnrollees = async (activity: ActivitySummaryRow) => {
    setSelectedActivity(activity);
    setEnrolleesLoading(true);
    setEnrollees([]);
    try {
      const res = await fetch(`/api/admin/reports/activities/${activity.activityId}`);
      if (!res.ok) {
        throw new Error(`Failed to load enrollees (status ${res.status})`);
      }
      const data: Enrollee[] = await res.json();
      setEnrollees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setEnrolleesLoading(false);
    }
  };

  if (loading) {
    return <p className="text-zinc-500 py-10 text-center">Loading reports...</p>;
  }

  if (error || !reports) {
    return (
      <p className="text-red-600 py-10 text-center">
        {error ?? "Something went wrong loading reports."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-800">Admin Reports</h1>
        <button
          type="button"
          onClick={() => {
            if (!reports) return;
            setPdfGenerating(true);
            try {
              generateReportsPdf(reports);
            } catch (err) {
              console.error("Failed to generate PDF:", err);
            } finally {
              setPdfGenerating(false);
            }
          }}
          disabled={pdfGenerating}
          className="rounded-lg bg-green-800 hover:bg-green-900 transition-colors text-white text-sm font-medium py-2 px-4 disabled:opacity-40"
        >
          {pdfGenerating ? "Generating PDF..." : "Download All as PDF"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Registration Summary */}
        <StatCard
          title="Registration Summary"
          value={reports.registrationSummary.total}
          valueLabel="Total Applications"
          breakdown={reports.registrationSummary.byStatus.map((r) => ({
            label: r.status,
            value: r.count,
          }))}
          breakdownLabel="By Status"
        />

        {/* 2. Payment Collections */}
        <StatCard
          title="Payment Collections"
          value={`₱${reports.paymentCollections.totalEstimatedAmount.toLocaleString()}`}
          valueLabel="Estimated Total Collected"
          breakdown={reports.paymentCollections.byStatus.map((r) => ({
            label: r.paymentStatus,
            value: `${r.count} (₱${r.estimatedAmount.toLocaleString()})`,
          }))}
          breakdownLabel="By Payment Status"
          note={reports.paymentCollections.note}
        />

        {/* 3. Registrations by Region/Council */}
        <StatCard
          title="Registrations by Region/Council"
          breakdown={reports.registrationsByRegionCouncil.map((r) => ({
            label: `${r.regionName ?? "Unassigned Region"} — ${r.councilName}`,
            value: r.count,
          }))}
        />

        {/* 4. Registrations Over Time */}
        <StatCard
          title="Registrations Over Time"
          breakdown={reports.registrationsOverTime.map((r) => ({
            label: r.month,
            value: r.count,
          }))}
          breakdownLabel="By Month"
        />

        {/* 5. Membership Fee Revenue by Tenure */}
        <StatCard
          title="Revenue by Tenure"
          breakdown={reports.revenueByTenure.map((r) => ({
            label: `${r.registrationYears} year${r.registrationYears > 1 ? "s" : ""}`,
            value: `₱${r.estimatedRevenue.toLocaleString()} (${r.count} paid)`,
          }))}
          note="Revenue is estimated at PHP 50/year and counts paid registrations only."
        />

        {/* 6. Activities & Enrollment */}
        <StatCard title="Activities & Enrollment">
          <ul className="flex flex-col gap-2">
            {reports.activitiesSummary.map((activity) => (
              <li
                key={activity.activityId}
                className="flex items-center justify-between text-sm border-b border-zinc-100 pb-2 last:border-0"
              >
                <div>
                  <p className="font-medium text-zinc-900">{activity.title}</p>
                  <p className="text-xs text-zinc-500">
                    {activity.category} — {activity.enrolledCount} enrolled
                    {activity.maxParticipants ? ` / ${activity.maxParticipants} max` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onViewEnrollees(activity)}
                  className="text-green-800 text-xs font-medium underline shrink-0 ml-2"
                >
                  View Enrollees
                </button>
              </li>
            ))}
            {reports.activitiesSummary.length === 0 && (
              <p className="text-sm text-zinc-500">No activities found.</p>
            )}
          </ul>
        </StatCard>
      </div>

      {/* Drill-down panel for selected activity's enrollees */}
      {selectedActivity && (
        <div className="bg-white rounded-2xl shadow p-6 text-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-800">
              Enrolled Scouts — {selectedActivity.title}
            </h3>
            <button
              type="button"
              onClick={() => setSelectedActivity(null)}
              className="text-sm text-zinc-500 underline"
            >
              Close
            </button>
          </div>

          {enrolleesLoading && <p className="text-zinc-500">Loading enrollees...</p>}

          {!enrolleesLoading && enrollees.length === 0 && (
            <p className="text-sm text-zinc-500">No scouts enrolled in this activity.</p>
          )}

          {!enrolleesLoading && enrollees.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Membership #</th>
                    <th className="py-2 pr-4">Rank</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollees.map((e) => (
                    <tr key={e.registrationId} className="border-b border-zinc-100">
                      <td className="py-2 pr-4">
                        {e.firstName} {e.middleName ? `${e.middleName} ` : ""}
                        {e.lastName}
                      </td>
                      <td className="py-2 pr-4">{e.membershipNumber ?? "—"}</td>
                      <td className="py-2 pr-4">{e.rank}</td>
                      <td className="py-2 pr-4">{e.scoutStatus}</td>
                      <td className="py-2 pr-4">{e.email}</td>
                      <td className="py-2 pr-4">
                        {new Date(e.registeredAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}