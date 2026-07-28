// src/app/admin/api/reports/activities/[activityId]/route.ts
import { NextResponse } from "next/server";
import { getActivityEnrollees } from "@/db/queries/reports.queries";
// Fetches detailed enrollee records for a specific activity by ID for activity reporting
export async function GET(
  request: Request, { params }: { params: Promise<{ activityId: string }> }) {
  try {
    const { activityId } = await params;
    if (!activityId) return NextResponse.json({ error: "activityId is required" }, { status: 400 });
    const enrollees = await getActivityEnrollees(activityId);
    return NextResponse.json(enrollees);
  } catch (error) {
    console.error("Error fetching activity enrollees:", error);
    return NextResponse.json({ error: "Failed to fetch activity enrollees" }, { status: 500 });
  }
}