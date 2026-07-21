// src/app/api/admin/login/route.ts
// Hardcoded admin credentials for now. Move ADMIN_USERNAME / ADMIN_PASSWORD
// into .env.local (and read via process.env) once this stops being a placeholder.

import { NextRequest, NextResponse } from "next/server";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "changeme123"; // TODO: replace before any real deployment

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return NextResponse.json(
      { message: "Invalid username or password." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ success: true });

  res.cookies.set("admin_session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });

  return res;
}