// src/app/api/admin/reports/route.ts
//
// GET /api/admin/reports
// Returns all 6 admin reports in one payload.
// Protected by proxy.ts matcher ("/api/admin/:path*") — requires a valid
// bsp_session cookie. Officer-level (adminUser) check is not yet enforced
// here — flagged as a follow-up, see proxy.ts comments.

import { NextResponse } from "next/server";
import { getAllReports } from "@/db/queries/reports.queries";

export async function GET() {
  try {
    const reports = await getAllReports();
    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching admin reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}