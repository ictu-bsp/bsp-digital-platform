//src/app/api/admin/activites/[id]/route.ts

import { NextResponse } from "next/server";

import {
  deleteActivity,
  getActivityById,
  updateActivity,
} from "@/services/activity.service";

import { ActivitySchema } from "@/lib/validation/common/activity";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const activity = await getActivityById(id);

  if (!activity) {
    return NextResponse.json(
      { message: "Activity not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(activity);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const body = await req.json();

  const parsed = ActivitySchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      parsed.error.flatten(),
      { status: 400 }
    );
  }

  const activity = await updateActivity(id, parsed.data);

  return NextResponse.json(activity);
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await deleteActivity(id);

  return NextResponse.json({
    success: true,
  });
}