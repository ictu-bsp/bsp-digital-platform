// src/app/admin/reports/lib/generateReportsPdf.ts
// Generates a client-side, multi-section PDF summarizing all 6 admin reports.
// Uses jsPDF + jspdf-autotable for real selectable text/tables (not a screenshot).

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

export type AllReports = {
  registrationSummary: RegistrationSummary;
  paymentCollections: PaymentCollections;
  registrationsByRegionCouncil: RegionCouncilRow[];
  registrationsOverTime: OverTimeRow[];
  revenueByTenure: RevenueByTenureRow[];
  activitiesSummary: ActivitySummaryRow[];
};

const GREEN: [number, number, number] = [22, 101, 52]; // matches Tailwind green-800

export function generateReportsPdf(reports: AllReports) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const marginX = 40;
  let cursorY = 50;

  const addSectionTitle = (text: string) => {
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GREEN);
    doc.text(text, marginX, cursorY);
    cursorY += 18;
  };

  const afterTable = () => {
    // jspdf-autotable attaches finalY to the doc instance after each call
    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;
  };

  // ---- Header ----
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GREEN);
  doc.text("BSP Admin Reports", marginX, cursorY);
  cursorY += 16;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated: ${new Date().toLocaleString()}`, marginX, cursorY);
  cursorY += 26;

  // ---- 1. Registration Summary ----
  addSectionTitle(`1. Registration Summary — Total: ${reports.registrationSummary.total}`);
  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX, right: marginX },
    head: [["Status", "Count"]],
    body: reports.registrationSummary.byStatus.map((r) => [r.status, String(r.count)]),
    theme: "grid",
    headStyles: { fillColor: GREEN },
    styles: { fontSize: 9 },
  });
  afterTable();

  // ---- 2. Payment Collections ----
  addSectionTitle(
    `2. Payment Collections — Est. Total: PHP ${reports.paymentCollections.totalEstimatedAmount.toLocaleString()}`
  );
  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX, right: marginX },
    head: [["Payment Status", "Count", "Estimated Amount"]],
    body: reports.paymentCollections.byStatus.map((r) => [
      r.paymentStatus,
      String(r.count),
      `PHP ${r.estimatedAmount.toLocaleString()}`,
    ]),
    theme: "grid",
    headStyles: { fillColor: GREEN },
    styles: { fontSize: 9 },
  });
  afterTable();
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(140, 140, 140);
  doc.text(reports.paymentCollections.note, marginX, cursorY - 14, { maxWidth: 515 });

  // ---- 3. Registrations by Region/Council ----
  addSectionTitle("3. Registrations by Region/Council");
  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX, right: marginX },
    head: [["Region", "Council", "Count"]],
    body: reports.registrationsByRegionCouncil.map((r) => [
      r.regionName ?? "Unassigned Region",
      r.councilName,
      String(r.count),
    ]),
    theme: "grid",
    headStyles: { fillColor: GREEN },
    styles: { fontSize: 9 },
  });
  afterTable();

  // ---- 4. Registrations Over Time ----
  addSectionTitle("4. Registrations Over Time");
  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX, right: marginX },
    head: [["Month", "Count"]],
    body: reports.registrationsOverTime.map((r) => [r.month, String(r.count)]),
    theme: "grid",
    headStyles: { fillColor: GREEN },
    styles: { fontSize: 9 },
  });
  afterTable();

  // ---- 5. Revenue by Tenure ----
  addSectionTitle("5. Revenue by Tenure");
  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX, right: marginX },
    head: [["Years", "Paid Count", "Estimated Revenue"]],
    body: reports.revenueByTenure.map((r) => [
      `${r.registrationYears} year${r.registrationYears > 1 ? "s" : ""}`,
      String(r.count),
      `PHP ${r.estimatedRevenue.toLocaleString()}`,
    ]),
    theme: "grid",
    headStyles: { fillColor: GREEN },
    styles: { fontSize: 9 },
  });
  afterTable();
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(140, 140, 140);
  doc.text(
    "Revenue is estimated at PHP 50/year and counts paid registrations only.",
    marginX,
    cursorY - 14
  );

  // ---- 6. Activities & Enrollment ----
  addSectionTitle("6. Activities & Enrollment");
  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX, right: marginX },
    head: [["Title", "Category", "Enrolled", "Max", "Published"]],
    body: reports.activitiesSummary.map((a) => [
      a.title,
      a.category,
      String(a.enrolledCount),
      a.maxParticipants ? String(a.maxParticipants) : "—",
      a.isPublished ? "Yes" : "No",
    ]),
    theme: "grid",
    headStyles: { fillColor: GREEN },
    styles: { fontSize: 9 },
  });

  doc.save(`bsp-admin-reports-${new Date().toISOString().slice(0, 10)}.pdf`);
}