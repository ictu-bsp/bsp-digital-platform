// src/app/api/admin/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { adminUsers } from "@/db/schema";

import { verifyPassword } from "@/lib/auth/hash";
import { getSessionCookie } from "@/lib/auth/cookies";

import {
  getCurrentUser,
  attachAdminUserToSession,
} from "@/lib/auth/session";

export async function POST(
  req: NextRequest
) {
  try {
    const {
      username,
      password,
    } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        {
          message:
            "Username and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    // -------------------------------------------------
    // Validate BSP Login Session
    // -------------------------------------------------

    const sessionId =
      await getSessionCookie();

    if (!sessionId) {
      return NextResponse.json(
        {
          message:
            "Your session has expired. Please log in again.",
        },
        {
          status: 401,
        }
      );
    }

    const user =
      await getCurrentUser(sessionId);

    if (!user) {
      return NextResponse.json(
        {
          message:
            "Your session has expired. Please log in again.",
        },
        {
          status: 401,
        }
      );
    }

    if (
      user.role !== "COUNCIL_ADMIN" &&
      user.role !== "SUPER_ADMIN"
    ) {
      return NextResponse.json(
        {
          message:
            "You are not authorized to access the Admin Dashboard.",
        },
        {
          status: 403,
        }
      );
    }

    // -------------------------------------------------
    // Find Officer Account
    // -------------------------------------------------

    const adminUser =
      await db.query.adminUsers.findFirst({
        where: eq(
          adminUsers.username,
          username
        ),
      });

    if (!adminUser) {
      return NextResponse.json(
        {
          message:
            "Invalid username or password.",
        },
        {
          status: 401,
        }
      );
    }

    if (!adminUser.active) {
      return NextResponse.json(
        {
          message:
            "This administrator account has been disabled.",
        },
        {
          status: 403,
        }
      );
    }

    // -------------------------------------------------
    // TODO:
    // Verify the officer belongs to the same Council.
    //
    // Replace this later with a councilId comparison
    // once the logged-in Council Admin's council can
    // be retrieved.
    // -------------------------------------------------

    if (
      user.role === "COUNCIL_ADMIN" &&
      adminUser.createdBy !== user.id
    ) {
      return NextResponse.json(
        {
          message:
            "This administrator account does not belong to your council.",
        },
        {
          status: 403,
        }
      );
    }

    // -------------------------------------------------
    // Verify Password
    // -------------------------------------------------

    const passwordMatches =
      await verifyPassword(
        password,
        adminUser.passwordHash
      );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          message:
            "Invalid username or password.",
        },
        {
          status: 401,
        }
      );
    }

    // -------------------------------------------------
    // Update Login Timestamp
    // -------------------------------------------------

    await db
      .update(adminUsers)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        eq(
          adminUsers.id,
          adminUser.id
        )
      );

    // -------------------------------------------------
    // Attach Officer to Existing Session
    // -------------------------------------------------

    await attachAdminUserToSession(
      sessionId,
      adminUser.id
    );

    return NextResponse.json({
      success: true,
      role: adminUser.role,
      fullName: adminUser.fullName,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message:
          "Unable to log in.",
      },
      {
        status: 500,
      }
    );
  }
}