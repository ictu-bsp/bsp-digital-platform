// src/app/api/admin/reports/route.ts
//
// GET /api/admin/reports?dateFrom=...&dateTo=...&councilId=...&scoutStatus=...&rank=...
// Returns all admin reports in one payload, optionally filtered.
// Enforced via requireAdminRole(). Financial sections are stripped for
// roles outside FINANCIAL_ROLES.

import { NextRequest, NextResponse } from "next/server";
import { getAllReports, type ReportFilters } from "@/db/queries/reports.queries";
import { requireAdminRole } from "@/lib/auth/requireAdminRole";

const ALL_ADMIN_ROLES = [
  "CHIEF_EXECUTIVE",
  "MEMBERSHIP_OFFICER",
  "ACTIVITIES_OFFICER",
  "FINANCE_OFFICER",
  "REGISTRAR",
  "REPORTS_OFFICER",
] as const;

const FINANCIAL_ROLES = ["CHIEF_EXECUTIVE", "FINANCE_OFFICER"] as const;

function parseFilters(request: NextRequest): ReportFilters {
  const params = request.nextUrl.searchParams;
  const dateFromRaw = params.get("dateFrom");
  const dateToRaw = params.get("dateTo");

  return {
    dateFrom: dateFromRaw ? new Date(dateFromRaw) : undefined,
    dateTo: dateToRaw ? new Date(dateToRaw) : undefined,
    councilId: params.get("councilId") ?? undefined,
    scoutStatus: params.get("scoutStatus") ?? undefined,
    rank: params.get("rank") ?? undefined,
  };
}

export async function GET(request: NextRequest) {
  const gate = await requireAdminRole(request, [...ALL_ADMIN_ROLES]);
  if (!gate.ok) return gate.response;

  try {
    const filters = parseFilters(request);
    const reports = await getAllReports(filters);
    const canViewFinancial = (FINANCIAL_ROLES as readonly string[]).includes(gate.adminUser.role);

    if (!canViewFinancial) {
      const { paymentCollections, revenueByTenure, ...rest } = reports;
      return NextResponse.json({
        ...rest,
        paymentCollections: null,
        revenueByTenure: null,
      });
    }

    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching admin reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}