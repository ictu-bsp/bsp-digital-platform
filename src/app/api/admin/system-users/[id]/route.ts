// src/app/api/admin/system-users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

import { getSessionCookie } from "@/lib/auth/cookies";
import { getCurrentSession } from "@/lib/auth/session";
import {
  getAdminUserById,
  updateAdminUser,
  deactivateAdminUser,
} from "@/services/admin.service";

async function requireAuthorizedSession() {
  const sessionId = await getSessionCookie();

  if (!sessionId) {
    return {
      error: NextResponse.json(
        { message: "Your session has expired. Please log in again." },
        { status: 401 }
      ),
    };
  }

  const session = await getCurrentSession(sessionId);

  if (!session) {
    return {
      error: NextResponse.json(
        { message: "Your session has expired. Please log in again." },
        { status: 401 }
      ),
    };
  }

  if (
    session.user.role !== "COUNCIL_ADMIN" &&
    session.user.role !== "SUPER_ADMIN"
  ) {
    return {
      error: NextResponse.json(
        { message: "You are not authorized to perform this action." },
        { status: 403 }
      ),
    };
  }

  return { session };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuthorizedSession();
  if (error) return error;

  const { id } = await params;

  const adminUser = await getAdminUserById(id);

  if (!adminUser) {
    return NextResponse.json(
      { message: "System user not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ adminUser });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuthorizedSession();
    if (error) return error;

    const { id } = await params;
    const body = await req.json();

    const {
      username,
      password,
      firstName,
      lastName,
      role,
      email,
      alternateEmail,
      passwordExpiration,
      accountLockThreshold,
      firstTimeUser,
      canChangePassword,
      turnOffEmailNotif,
      locked,
    } = body;

    const updated = await updateAdminUser(id, {
      username,
      firstName,
      lastName,
      role,
      email: email || null,
      alternateEmail: alternateEmail || null,
      passwordExpiration: passwordExpiration || null,
      accountLockThreshold:
        accountLockThreshold !== undefined && accountLockThreshold !== null
          ? Number(accountLockThreshold)
          : null,
      firstTimeUser: Boolean(firstTimeUser),
      canChangePassword: Boolean(canChangePassword),
      turnOffEmailNotif: Boolean(turnOffEmailNotif),
      locked: Boolean(locked),
      ...(password ? { password } : {}),
    });

    if (!updated) {
      return NextResponse.json(
        { message: "System user not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);

    if (error?.code === "23505") {
      return NextResponse.json(
        { message: "That username is already taken." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Unable to update system user." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuthorizedSession();
  if (error) return error;

  const { id } = await params;

  const deactivated = await deactivateAdminUser(id);

  if (!deactivated) {
    return NextResponse.json(
      { message: "System user not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}