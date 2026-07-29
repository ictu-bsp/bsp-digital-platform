// src/app/admin/reports/lib/generateReportsPdf.ts
//
// Cover page + one page per category (Membership, Registration, Activities,
// Financial), aggregated summary tables only (no per-scout row dumps —
// use CSV/Excel export for raw detail once available).
// Styled to read like a formal report: letterhead-style cover, consistent
// running header/footer with "Page X of Y", striped tables.

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

export type AllReports = {
  membershipSummary: MembershipSummary;
  membershipTrends: MembershipTrendRow[];
  scoutProfiles: ScoutProfileRow[];
  registrationSummary: RegistrationSummary;
  paymentCollections: PaymentCollections;
  registrationsByRegionCouncil: RegionCouncilRow[];
  registrationsOverTime: OverTimeRow[];
  revenueByTenure: RevenueByTenureRow[];
  registrationTypeBreakdown: RegistrationTypeBreakdown;
  activitiesSummary: ActivitySummaryRow[];
  enrolleeDetails: EnrolleeDetailRow[]; // accepted but not printed
};

const GREEN: [number, number, number] = [22, 101, 52];
const GREEN_DARK: [number, number, number] = [15, 71, 37];
const GRAY_TEXT: [number, number, number] = [90, 90, 90];
const GRAY_LIGHT: [number, number, number] = [245, 247, 245];
const MARGIN_X = 50;
const TABLE_FONT_SIZE = 9;

function groupCount<T>(rows: T[], keyFn: (row: T) => string): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = keyFn(row);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([label, count]) => ({ label, count }));
}

function fullName(e: EnrolleeDetailRow): string {
  return `${e.firstName} ${e.middleName ? e.middleName + " " : ""}${e.lastName}`;
}

export function generateReportsPdf(reports: AllReports) {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let cursorY = 0;
  let currentCategoryLabel = "";

  // Running header printed on every interior page (not the cover).
  const addRunningHeader = () => {
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY_TEXT);
    doc.text("BSP Admin Reports", MARGIN_X, 32);
    doc.text(
      new Date().toLocaleDateString(),
      pageWidth - MARGIN_X,
      32,
      { align: "right" }
    );
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(MARGIN_X, 40, pageWidth - MARGIN_X, 40);
  };

  // Footer text is placeholder-stamped now, then patched with real total
  // page count in the final pass below (jsPDF doesn't know the total until
  // every page has been added).
  const stampFooterPlaceholder = () => {
    doc.setFontSize(8),
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY_TEXT);
    doc.text(currentCategoryLabel, MARGIN_X, pageHeight - 28);
    doc.text(
      `Page {{PAGE_NUM}} of {{TOTAL_PAGES}}`,
      pageWidth - MARGIN_X,
      pageHeight - 28,
      { align: "right" }
    );
  };

  const startNewPage = (categoryTitle: string, footerLabel: string) => {
    doc.addPage();
    currentCategoryLabel = footerLabel;
    addRunningHeader();
    cursorY = 66;

    doc.setFontSize(17);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GREEN_DARK);
    doc.text(categoryTitle, MARGIN_X, cursorY);
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(1.4);
    doc.line(MARGIN_X, cursorY + 10, pageWidth - MARGIN_X, cursorY + 10);
    cursorY += 38;

    stampFooterPlaceholder();
  };

  const addSubheading = (text: string) => {
    doc.setFontSize(11.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text(text, MARGIN_X, cursorY);
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.4);
    doc.line(MARGIN_X, cursorY + 5, pageWidth - MARGIN_X, cursorY + 5);
    cursorY += 20;
  };

  const addTable = (head: string[], body: (string | number)[][]) => {
    autoTable(doc, {
      startY: cursorY,
      margin: { left: MARGIN_X, right: MARGIN_X },
      head: [head],
      body,
      theme: "striped",
      headStyles: {
        fillColor: GREEN,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: TABLE_FONT_SIZE,
      },
      alternateRowStyles: { fillColor: GRAY_LIGHT },
      styles: {
        fontSize: TABLE_FONT_SIZE,
        cellPadding: 6,
        textColor: [40, 40, 40],
        lineColor: [225, 225, 225],
        lineWidth: 0.5,
      },
    });
    cursorY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26;
  };

  const addSmallNote = (text: string) => {
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    const wrapped = doc.splitTextToSize(`Note: ${text}`, pageWidth - MARGIN_X * 2);
    doc.text(wrapped, MARGIN_X, cursorY);
    cursorY += wrapped.length * 11 + 18;
  };

  // ============================================================
  // Cover Page
  // ============================================================
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageWidth, 170, "F");

  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Boy Scouts of the Philippines", MARGIN_X, 80);

  doc.setFontSize(15);
  doc.setFont("helvetica", "normal");
  doc.text("Digital Platform — Admin Reports", MARGIN_X, 108);

  doc.setFontSize(9.5);
  doc.setTextColor(230, 240, 232);
  doc.text(`Generated: ${new Date().toLocaleString()}`, MARGIN_X, 138);

  cursorY = 220;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("Contents", MARGIN_X, cursorY);
  cursorY += 8;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_X, cursorY, pageWidth - MARGIN_X, cursorY);
  cursorY += 30;

  const contentsList = [
    { num: "1", label: "Membership" },
    { num: "2", label: "Registration" },
    { num: "3", label: "Activities" },
    { num: "4", label: "Financial" },
  ];
  doc.setFontSize(11.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(70, 70, 70);
  contentsList.forEach((item) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GREEN_DARK);
    doc.text(item.num, MARGIN_X, cursorY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(70, 70, 70);
    doc.text(item.label, MARGIN_X + 22, cursorY);
    cursorY += 26;
  });

  cursorY = pageHeight - 90;
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(1);
  doc.line(MARGIN_X, cursorY, pageWidth - MARGIN_X, cursorY);
  cursorY += 20;
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150, 150, 150);
  doc.text(
    "Restricted — Internal Use Only. This document may contain financial and personally identifiable information.",
    MARGIN_X,
    cursorY
  );

  // ============================================================
  // Page: Membership
  // ============================================================
  startNewPage("1.  Membership", "Membership");

  addSubheading(`Membership Summary  —  Total: ${reports.membershipSummary.total}`);
  addTable(
    ["Status", "Count"],
    reports.membershipSummary.byStatus.map((r) => [r.status, r.count])
  );
  addSmallNote(
    `Active: ${reports.membershipSummary.activeCount}  ·  Inactive: ${reports.membershipSummary.inactiveCount}`
  );

  addSubheading("Membership Trends (by Month)");
  addTable(
    ["Month", "New Scouts"],
    reports.membershipTrends.map((r) => [r.month, r.count])
  );

  const rankBreakdown = groupCount(reports.scoutProfiles, (s) => s.rank);
  addSubheading("Scout Profiles — by Rank");
  addTable(
    ["Rank", "Count"],
    rankBreakdown.map((r) => [r.label, r.count])
  );

  // ============================================================
  // Page: Registration
  // ============================================================
  startNewPage("2.  Registration", "Registration");

  addSubheading(`Registration Summary  —  Total: ${reports.registrationSummary.total}`);
  addTable(
    ["Status", "Count"],
    reports.registrationSummary.byStatus.map((r) => [r.status, r.count])
  );

  addSubheading("Registrations by Region / Council");
  addTable(
    ["Region", "Council", "Count"],
    reports.registrationsByRegionCouncil.map((r) => [
      r.regionName ?? "Unassigned Region",
      r.councilName,
      r.count,
    ])
  );

  addSubheading("Registrations Over Time (by Month)");
  addTable(
    ["Month", "Count"],
    reports.registrationsOverTime.map((r) => [r.month, r.count])
  );

  addSubheading(`Registration Type Breakdown  —  Total: ${reports.registrationTypeBreakdown.total}`);
  addTable(
    ["Type", "Count"],
    [
      ["New Registrations", reports.registrationTypeBreakdown.new],
      ["Renewals", reports.registrationTypeBreakdown.renewal],
    ]
  );

  // ============================================================
  // Page: Activities
  // ============================================================
  startNewPage("3.  Activities", "Activities");

  addSubheading(`Activities & Enrollment  —  ${reports.activitiesSummary.length} total`);
  addTable(
    ["Title", "Category", "Organizer", "Status", "Enrolled", "Published"],
    reports.activitiesSummary.map((a) => [
      a.title,
      a.category,
      a.organizerName,
      a.computedStatus,
      a.maxParticipants ? `${a.enrolledCount} / ${a.maxParticipants}` : `${a.enrolledCount}`,
      a.isPublished ? "Yes" : "No",
    ])
  );
  addSmallNote(
    "\"Enrolled\" reflects sign-ups, not confirmed attendance — attendance tracking is not yet implemented."
  );

  // ============================================================
  // Page: Financial
  // ============================================================
  startNewPage("4.  Financial", "Financial");

  addSubheading(
    `Payment Collections  —  Est. Total: PHP ${reports.paymentCollections.totalEstimatedAmount.toLocaleString()}`
  );
  addTable(
    ["Payment Status", "Count", "Estimated Amount"],
    reports.paymentCollections.byStatus.map((r) => [
      r.paymentStatus,
      r.count,
      `PHP ${r.estimatedAmount.toLocaleString()}`,
    ])
  );
  addSmallNote(reports.paymentCollections.note);

  addSubheading("Revenue by Tenure");
  addTable(
    ["Years", "Paid Count", "Estimated Revenue"],
    reports.revenueByTenure.map((r) => [
      `${r.registrationYears} year${r.registrationYears > 1 ? "s" : ""}`,
      r.count,
      `PHP ${r.estimatedRevenue.toLocaleString()}`,
    ])
  );
  addSmallNote("Revenue is estimated at PHP 50/year and counts paid registrations only.");

  const paidTransactions = reports.enrolleeDetails
    .filter((e) => e.paymentStatus === "paid")
    .sort((a, b) => {
      const ta = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
      const tb = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
      return tb - ta; // most recent first
    });

  addSubheading(`Individual Payments  —  ${paidTransactions.length} paid transactions`);
  addTable(
    ["Name", "Membership #", "Type", "Amount Paid", "Date Paid"],
    paidTransactions.map((e) => [
      fullName(e),
      e.membershipNumber ?? "—",
      e.registrationType,
      `PHP ${e.estimatedAmountPaid.toLocaleString()}`,
      e.paymentDate ? new Date(e.paymentDate).toLocaleDateString() : "—",
    ])
  );
  addSmallNote(
    "Shows only registrations with a confirmed \"paid\" status. Pending, failed, and no-payment registrations are excluded from this list."
  );

  // ============================================================
  // Final pass: patch every footer's placeholder tokens with the real
  // page number / total page count now that all pages exist.
  // ============================================================
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    // Page 1 is the cover and has no footer placeholder to patch.
    doc.setPage(i);
    // jsPDF has no direct "find and replace text" API, so we redraw over
    // the placeholder area with the resolved string using the same
    // coordinates used in stampFooterPlaceholder(). We reconstruct the
    // right-aligned page label by covering the old text with a white
    // rectangle first, then writing the real value.
    doc.setFillColor(255, 255, 255);
    doc.rect(pageWidth - MARGIN_X - 140, pageHeight - 40, 140, 16, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY_TEXT);
    doc.text(`Page ${i - 1} of ${totalPages - 1}`, pageWidth - MARGIN_X, pageHeight - 28, {
      align: "right",
    });
  }

  doc.save(`bsp-admin-reports-${new Date().toISOString().slice(0, 10)}.pdf`);
}