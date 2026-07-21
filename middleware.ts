// middleware.ts
// Protects all /admin/* routes except /admin/login itself.
// Checks for the admin_session cookie set by /api/admin/login.

import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const isLoginPage = req.nextUrl.pathname === "/admin/login";
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

  if (!isAdminRoute || isLoginPage) {
    return NextResponse.next();
  }

  const session = req.cookies.get("admin_session");

  if (!session || session.value !== "authenticated") {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};