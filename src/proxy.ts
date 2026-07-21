// src/proxy.ts

import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
];

export function proxy(
  request: NextRequest
) {
  const pathname =
    request.nextUrl.pathname;

  const session =
    request.cookies.get("bsp_session");

  const isPublic =
    PUBLIC_ROUTES.some(
      (route) =>
        pathname === route ||
        pathname.startsWith(route + "/")
    );

  //
  // Visitors attempting to access protected pages
  //

  if (!session && !isPublic) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  //
  // Logged-in users should never revisit Login or Signup.
  // Everyone enters the application through /scout,
  // which determines whether they're a Visitor,
  // Scout, Council Admin, or Super Admin.
  //

  if (
    session &&
    (
      pathname === "/login" ||
      pathname.startsWith("/signup")
    )
  ) {
    return NextResponse.redirect(
      new URL("/scout", request.url)
    );
  }

  //
  // Officer authentication is intentionally NOT handled here.
  //
  // Middleware only checks whether a BSP account is logged in.
  // AdminLayout performs the second-stage officer authentication
  // by checking session.adminUser and redirecting to
  // /admin/login when necessary.
  //

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/scout/:path*",
    "/admin/:path*",
  ],
};