// src/app/api/admin/system-users/route.ts

import { NextRequest, NextResponse } from "next/server";

import { getSessionCookie } from "@/lib/auth/cookies";
import { getCurrentSession } from "@/lib/auth/session";
import { createAdminUser } from "@/services/admin.service";

export async function POST(req: NextRequest) {
  try {
    const sessionId = await getSessionCookie();

    if (!sessionId) {
      return NextResponse.json(
        { message: "Your session has expired. Please log in again." },
        { status: 401 }
      );
    }

    const session = await getCurrentSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { message: "Your session has expired. Please log in again." },
        { status: 401 }
      );
    }

    if (
      session.user.role !== "COUNCIL_ADMIN" &&
      session.user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        { message: "You are not authorized to perform this action." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const {
      councilId,
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

    if (!councilId || !username || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        {
          message:
            "Council, username, password, first name, last name, and role are required.",
        },
        { status: 400 }
      );
    }

    const created = await createAdminUser({
      councilId,
      createdBy: session.user.id,
      addedBy: session.adminUser?.id ?? null,

      username,
      password,
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
    });

    return NextResponse.json({ success: true, id: created.id });
  } catch (error: any) {
    console.error(error);

    if (error?.code === "23505") {
      return NextResponse.json(
        { message: "That username is already taken." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Unable to create system user." },
      { status: 500 }
    );
  }
}