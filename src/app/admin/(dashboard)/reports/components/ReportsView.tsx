// src/app/admin/dashboard/reports/components/ReportsView.tsx
"use client";
import { useEffect, useState } from "react";
import StatCard from "./StatCard";
import { generateReportsPdf } from "../lib/generateReportsPdf";
import type { AllReports as PdfAllReports } from "../lib/generateReportsPdf";
import ReportTable from "./ReportTable";

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

type RegistrationTypeBreakdown = {
  new: number;
  renewal: number;
  total: number;
};

type EnrolleeDetailRow = {
  scoutId: string;
  membershipNumber: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  councilName: string;
  regionName: string | null;
  registrationYears: number;
  registrationStatus: string;
  registrationType: string;
  paymentStatus: string;
  paymentMethod: string | null;
  estimatedAmountPaid: number;
  paymentDate: string | null;
  activitiesEnrolled: string[];
  registeredAt?: string;
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
  organizerName: string;
  computedStatus: "upcoming" | "ongoing" | "completed";
  enrolledCount: number;
};

type MembershipStatusRow = {
  status: string;
  count: number;
};

type MembershipSummary = {
  byStatus: MembershipStatusRow[];
  total: number;
  activeCount: number;
  inactiveCount: number;
};

type MembershipTrendRow = {
  month: string;
  count: number;
};

type AllReports = {
  membershipSummary: MembershipSummary;
  membershipTrends: MembershipTrendRow[];
  registrationSummary: RegistrationSummary;
  paymentCollections: PaymentCollections | null;
  registrationsByRegionCouncil: RegionCouncilRow[];
  registrationsOverTime: OverTimeRow[];
  revenueByTenure: RevenueByTenureRow[] | null;
  registrationTypeBreakdown: RegistrationTypeBreakdown;
  activitiesSummary: ActivitySummaryRow[];
  scoutProfiles: ScoutProfileRow[];
  enrolleeDetails: EnrolleeDetailRow[];
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

type ScoutProfileRow = {
  scoutId: string;
  membershipNumber: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string;
  age: number;
  rank: string;
  status: string;
  isActive: boolean;
  councilName: string;
  regionName: string | null;
  joinedAt: string | null;
  registrationHistory: {
    registrationId: string;
    status: string;
    registrationYears: number;
    startDate: string;
    endDate: string;
    createdAt: string;
  }[];
  activitiesEnrolled: { title: string; registeredAt: string }[];
};

type FilterState = {
  dateFrom: string; // yyyy-mm-dd, empty string = unset
  dateTo: string;
  councilId: string;
  scoutStatus: string;
  rank: string;
};

const EMPTY_FILTERS: FilterState = {
  dateFrom: "",
  dateTo: "",
  councilId: "",
  scoutStatus: "",
  rank: "",
};

// Render dashboard reports view containing registration summaries, metrics, and activity enrollee details.
export default function ReportsView() {
  const [reports, setReports] = useState<AllReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [pendingFilters, setPendingFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [activeTab, setActiveTab] = useState<"membership" | "registration" | "activities" | "financial">("membership");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [selectedActivity, setSelectedActivity] = useState<ActivitySummaryRow | null>(null);
  const [enrollees, setEnrollees] = useState<Enrollee[]>([]);
  const [enrolleesLoading, setEnrolleesLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  useEffect(() => {
    // Fetch initial report summaries from API endpoint.
    async function loadReports() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
        if (filters.dateTo) params.set("dateTo", filters.dateTo);
        if (filters.councilId) params.set("councilId", filters.councilId);
        if (filters.scoutStatus) params.set("scoutStatus", filters.scoutStatus);
        if (filters.rank) params.set("rank", filters.rank);

        const query = params.toString();
        const res = await fetch(`/admin/api/reports${query ? `?${query}` : ""}`);
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
  }, [filters]);

  const onApplyFilters = () => setFilters(pendingFilters);
  const onClearFilters = () => {
    setPendingFilters(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
  };

  // Fetch detailed list of enrollees for a specific activity.
  const onViewEnrollees = async (activity: ActivitySummaryRow) => {
    setSelectedActivity(activity);
    setEnrolleesLoading(true);
    setEnrollees([]);
    try {
      const res = await fetch(`/admin/api/reports/activities/${activity.activityId}`);
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-green-800">Admin Reports</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            className="rounded-lg border border-zinc-300 text-zinc-700 text-sm font-medium py-2 px-4"
          >
            {filtersOpen ? "Hide Filters" : "Filters"}
          </button>
          <button
            type="button"
            onClick={() => {
            if (!reports?.paymentCollections || !reports?.revenueByTenure) return;
            setPdfGenerating(true);
            try {
              const pdfReports: PdfAllReports = {
                membershipSummary: reports.membershipSummary,
                membershipTrends: reports.membershipTrends,
                scoutProfiles: reports.scoutProfiles,
                registrationSummary: reports.registrationSummary,
                paymentCollections: reports.paymentCollections,
                registrationsByRegionCouncil: reports.registrationsByRegionCouncil,
                registrationsOverTime: reports.registrationsOverTime,
                revenueByTenure: reports.revenueByTenure,
                registrationTypeBreakdown: reports.registrationTypeBreakdown,
                activitiesSummary: reports.activitiesSummary,
                enrolleeDetails: reports.enrolleeDetails,
              };
              generateReportsPdf(pdfReports);
            } catch (err) {
              console.error("Failed to generate PDF:", err);
            } finally {
              setPdfGenerating(false);
            }
          }}
            disabled={pdfGenerating || !reports.paymentCollections || !reports.revenueByTenure}
            className="rounded-lg bg-green-800 hover:bg-green-900 transition-colors text-white text-sm font-medium py-2 px-4 disabled:opacity-40"
          >
            {pdfGenerating ? "Generating PDF..." : "Download All as PDF"}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 border-b border-zinc-200">
        {(
          [
            { key: "membership", label: "Membership" },
            { key: "registration", label: "Registration" },
            { key: "activities", label: "Activities" },
            { key: "financial", label: "Financial" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`text-sm font-medium px-4 py-2.5 border-b-2 -mb-px transition-colors ${
              activeTab === tab.key
                ? "border-green-800 text-green-800"
                : "border-transparent text-zinc-500 hover:text-zinc-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Collapsible filter bar */}
      {filtersOpen && (
        <div className="bg-white rounded-2xl shadow p-5 flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600">From</label>
            <input
              type="date"
              value={pendingFilters.dateFrom}
              onChange={(e) => setPendingFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              className="border rounded px-2 py-1.5 text-sm text-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600">To</label>
            <input
              type="date"
              value={pendingFilters.dateTo}
              onChange={(e) => setPendingFilters((f) => ({ ...f, dateTo: e.target.value }))}
              className="border rounded px-2 py-1.5 text-sm text-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600">Scout Status</label>
            <select
              value={pendingFilters.scoutStatus}
              onChange={(e) => setPendingFilters((f) => ({ ...f, scoutStatus: e.target.value }))}
              className="border rounded px-2 py-1.5 text-sm text-zinc-900"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-600">Rank</label>
            <select
              value={pendingFilters.rank}
              onChange={(e) => setPendingFilters((f) => ({ ...f, rank: e.target.value }))}
              className="border rounded px-2 py-1.5 text-sm text-zinc-900"
            >
              <option value="">All</option>
              <option value="KID">Kid</option>
              <option value="KAB">Kab</option>
              <option value="BOY">Boy</option>
              <option value="SENIOR">Senior</option>
              <option value="ROVER">Rover</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onApplyFilters}
              className="rounded-lg bg-green-800 hover:bg-green-900 text-white text-sm font-medium py-2 px-4"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={onClearFilters}
              className="rounded-lg border border-zinc-300 text-zinc-700 text-sm font-medium py-2 px-4"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">

        {/* 0a. Membership Summary */}
        {activeTab === "membership" && (
          <StatCard
            title="Membership Summary"
            value={reports.membershipSummary.total}
            valueLabel="Total Scouts"
          >
            <ReportTable
              columns={[
                { header: "Status", accessor: (r) => r.status },
                { header: "Count", accessor: (r) => r.count, align: "right" },
              ]}
              rows={reports.membershipSummary.byStatus}
            />
            <p className="text-sm text-zinc-600 mt-2">
              Active: <span className="font-medium">{reports.membershipSummary.activeCount}</span>
              {" · "}
              Inactive: <span className="font-medium">{reports.membershipSummary.inactiveCount}</span>
            </p>
          </StatCard>
        )}

        {/* 0b. Membership Trends */}
        {activeTab === "membership" && (
          <StatCard title="Membership Trends">
            <ReportTable
              columns={[
                { header: "Month", accessor: (r) => r.month },
                { header: "New Scouts", accessor: (r) => r.count, align: "right" },
              ]}
              rows={reports.membershipTrends}
            />
          </StatCard>
        )}

        {/* 0c. Scout Profiles */}
        {activeTab === "membership" && (
          <StatCard title="Scout Profiles" value={reports.scoutProfiles.length} valueLabel="Total Scout Records">
            <ReportTable
              columns={[
                {
                  header: "Name",
                  accessor: (s) =>
                    `${s.firstName} ${s.middleName ? s.middleName + " " : ""}${s.lastName}`,
                },
                { header: "Membership #", accessor: (s) => s.membershipNumber ?? "—" },
                { header: "Age", accessor: (s) => s.age, align: "right" },
                { header: "Rank", accessor: (s) => s.rank },
                { header: "Status", accessor: (s) => s.status },
                { header: "Council", accessor: (s) => s.councilName },
                {
                  header: "Activities",
                  accessor: (s) =>
                    s.activitiesEnrolled.length > 0
                      ? s.activitiesEnrolled.map((a) => a.title).join(", ")
                      : "—",
                },
              ]}
              rows={reports.scoutProfiles}
            />
          </StatCard>
        )}

        {/* 1. Registration Summary */}
        {activeTab === "registration" && (
          <StatCard
            title="Registration Summary"
            value={reports.registrationSummary.total}
            valueLabel="Total Applications"
          >
            <ReportTable
              columns={[
                { header: "Status", accessor: (r) => r.status },
                { header: "Count", accessor: (r) => r.count, align: "right" },
              ]}
              rows={reports.registrationSummary.byStatus}
            />
          </StatCard>
        )}

        {/* 2. Payment Collections */}
        {activeTab === "financial" && (
          reports.paymentCollections ? (
            <StatCard
              title="Payment Collections"
              value={`₱${reports.paymentCollections.totalEstimatedAmount.toLocaleString()}`}
              valueLabel="Estimated Total Collected"
              note={reports.paymentCollections.note}
            >
              <ReportTable
                columns={[
                  { header: "Payment Status", accessor: (r) => r.paymentStatus },
                  { header: "Count", accessor: (r) => r.count, align: "right" },
                  {
                    header: "Estimated Amount",
                    accessor: (r) => `₱${r.estimatedAmount.toLocaleString()}`,
                    align: "right",
                  },
                ]}
                rows={reports.paymentCollections.byStatus}
              />
            </StatCard>
          ) : (
            <StatCard title="Payment Collections">
              <p className="text-sm text-zinc-500">
                You don't have permission to view financial data.
              </p>
            </StatCard>
          )
        )}

        {/* 3. Registrations by Region/Council */}
        {activeTab === "registration" && (
          <StatCard title="Registrations by Region/Council">
            <ReportTable
              columns={[
                { header: "Region", accessor: (r) => r.regionName ?? "Unassigned Region" },
                { header: "Council", accessor: (r) => r.councilName },
                { header: "Count", accessor: (r) => r.count, align: "right" },
              ]}
              rows={reports.registrationsByRegionCouncil}
            />
          </StatCard>
        )}

        {/* 4. Registrations Over Time */}
        {activeTab === "registration" && (
          <StatCard title="Registrations Over Time">
            <ReportTable
              columns={[
                { header: "Month", accessor: (r) => r.month },
                { header: "Count", accessor: (r) => r.count, align: "right" },
              ]}
              rows={reports.registrationsOverTime}
            />
          </StatCard>
        )}

        {/* 5. Membership Fee Revenue by Tenure */}
        {activeTab === "financial" && (
          <StatCard
            title="Revenue by Tenure"
            note="Revenue is estimated at PHP 50/year and counts paid registrations only."
          >
            <ReportTable
              columns={[
                {
                  header: "Years",
                  accessor: (r) =>
                    `${r.registrationYears} year${r.registrationYears > 1 ? "s" : ""}`,
                },
                { header: "Paid Count", accessor: (r) => r.count, align: "right" },
                {
                  header: "Estimated Revenue",
                  accessor: (r) => `₱${r.estimatedRevenue.toLocaleString()}`,
                  align: "right",
                },
              ]}
              rows={reports.revenueByTenure ?? []}
            />
          </StatCard>
        )}

        {/* 5b2. Registration Details — per-scout list with payment + activities */}
        {activeTab === "registration" && (
          <StatCard
            title="Registration Details"
            value={reports.enrolleeDetails.length}
            valueLabel="Total Registration Records"
            note="Includes all registrations regardless of payment status."
          >
            <ReportTable
              columns={[
                {
                  header: "Name",
                  accessor: (e) =>
                    `${e.firstName} ${e.middleName ? e.middleName + " " : ""}${e.lastName}`,
                },
                { header: "Membership #", accessor: (e) => e.membershipNumber ?? "—" },
                { header: "Council", accessor: (e) => e.councilName },
                { header: "Region", accessor: (e) => e.regionName ?? "Unassigned Region" },
                { header: "Type", accessor: (e) => e.registrationType },
                { header: "Reg. Status", accessor: (e) => e.registrationStatus },
                { header: "Payment Status", accessor: (e) => e.paymentStatus },
                { header: "Method", accessor: (e) => e.paymentMethod ?? "—" },
                {
                  header: "Activities Joined",
                  accessor: (e) =>
                    e.activitiesEnrolled.length > 0
                      ? e.activitiesEnrolled.join(", ")
                      : "—",
                },
                {
                  header: "Registered At",
                  accessor: (e) =>
                    e.registeredAt ? new Date(e.registeredAt).toLocaleDateString() : "—",
                },
              ]}
              rows={[...reports.enrolleeDetails].sort((a, b) => {
                const ta = a.registeredAt ? new Date(a.registeredAt).getTime() : 0;
                const tb = b.registeredAt ? new Date(b.registeredAt).getTime() : 0;
                return tb - ta; // most recent first
              })}
            />
          </StatCard>
        )}

        {/* 5c. Individual Payments — who paid, how much, when */}
        {activeTab === "financial" && (
          <StatCard
            title="Individual Payments"
            value={reports.enrolleeDetails.filter((e) => e.paymentStatus === "paid").length}
            valueLabel="Paid Transactions"
            note="Shows only registrations with a confirmed 'paid' status. Pending, failed, and no-payment registrations are excluded."
          >
            <ReportTable
              columns={[
                {
                  header: "Name",
                  accessor: (e) =>
                    `${e.firstName} ${e.middleName ? e.middleName + " " : ""}${e.lastName}`,
                },
                { header: "Membership #", accessor: (e) => e.membershipNumber ?? "—" },
                { header: "Type", accessor: (e) => e.registrationType },
                { header: "Method", accessor: (e) => e.paymentMethod ?? "—" },
                {
                  header: "Amount Paid",
                  accessor: (e) => `₱${e.estimatedAmountPaid.toLocaleString()}`,
                  align: "right",
                },
                {
                  header: "Date Paid",
                  accessor: (e) =>
                    e.paymentDate ? new Date(e.paymentDate).toLocaleDateString() : "—",
                },
                {
                  header: "Activities",
                  accessor: (e) =>
                    e.activitiesEnrolled.length > 0
                      ? e.activitiesEnrolled.join(", ")
                      : "—",
                },
              ]}
              rows={reports.enrolleeDetails
                .filter((e) => e.paymentStatus === "paid")
                .sort((a, b) => {
                  const ta = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
                  const tb = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
                  return tb - ta;
                })}
            />
          </StatCard>
        )}

        {/* 6. Activities & Enrollment */}
        {activeTab === "activities" && (
          <StatCard title="Activities & Enrollment">
            <ReportTable
              columns={[
                { header: "Title", accessor: (a) => a.title },
                { header: "Category", accessor: (a) => a.category },
                { header: "Organizer", accessor: (a) => a.organizerName },
                {
                  header: "Status",
                  accessor: (a) => {
                    const label =
                      a.computedStatus === "upcoming"
                        ? "Upcoming"
                        : a.computedStatus === "ongoing"
                        ? "Ongoing"
                        : "Completed";
                    return label;
                  },
                },
                {
                  header: "Enrolled",
                  accessor: (a) =>
                    a.maxParticipants
                      ? `${a.enrolledCount} / ${a.maxParticipants}`
                      : `${a.enrolledCount}`,
                  align: "right",
                },
                {
                  header: "Published",
                  accessor: (a) => (a.isPublished ? "Yes" : "No"),
                },
                {
                  header: "",
                  accessor: (a) => (
                    <button
                      type="button"
                      onClick={() => onViewEnrollees(a)}
                      className="text-green-800 text-xs font-medium underline"
                    >
                      View Enrollees
                    </button>
                  ),
                },
              ]}
              rows={reports.activitiesSummary}
            />

            <p className="text-xs text-zinc-400 italic mt-2">
              "Enrolled" reflects sign-ups, not confirmed attendance — there is no attendance/check-in tracking in the system yet.
            </p>
          </StatCard>
        )}
      </div>
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh]
          overflow-y-auto p-8 text-zinc-900">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-green-800">
                Enrolled Scouts — {selectedActivity.title}
              </h3>
              <button type="button" onClick={() => setSelectedActivity(null)}
              className="text-red-600 border border-red-600 rounded-full
              w-7 h-7 flex items-center justify-center text-sm" aria-label="Close">
                ✕
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
        </div>
      )}
    </div>
  );
}