// src/app/api/admin/reports/activities/[activityId]/route.ts
//
// GET /api/admin/reports/activities/:activityId
// Drill-down: returns the list of scouts enrolled in a specific activity,
// with their info, for the Activities & Enrollment report.

import { NextResponse } from "next/server";
import { getActivityEnrollees } from "@/db/queries/reports.queries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ activityId: string }> }
) {
  try {
    const { activityId } = await params;

    if (!activityId) {
      return NextResponse.json(
        { error: "activityId is required" },
        { status: 400 }
      );
    }

    const enrollees = await getActivityEnrollees(activityId);
    return NextResponse.json(enrollees);
  } catch (error) {
    console.error("Error fetching activity enrollees:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity enrollees" },
      { status: 500 }
    );
  }
}