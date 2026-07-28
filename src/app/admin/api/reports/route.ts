// src/app/admin/api/reports/route.ts
import { NextResponse } from "next/server";
import { getAllReports } from "@/db/queries/reports.queries";
// Fetches all six admin reports in a single aggregated payload
export async function GET() {
  try {
    const reports = await getAllReports();
    return NextResponse.json(reports);
  } catch (error) {
    console.error("Error fetching admin reports:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}