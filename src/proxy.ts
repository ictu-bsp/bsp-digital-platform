// src/proxy.ts

import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/admin/login", // Required so users can reach the 2nd layer form
  "/scout/membership/membership-registration/webhook",
];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = request.cookies.get("bsp_session");

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // 1. Visitors attempting to access protected pages without any session
  if (!session && !isPublic) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Logged-in users attempting to access primary auth pages (/login, /signup)
  if (
    session &&
    (pathname === "/login" || pathname.startsWith("/signup"))
  ) {
    return NextResponse.redirect(new URL("/scout", request.url));
  }

  const response = NextResponse.next();

  // Disable back/forward browser caching (BFCache) on protected routes
  if (!isPublic) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/scout/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};