import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_ROUTES = ["/tell-us", "/brand-profile", "/dashboard", "/board"];

// Routes only for unauthenticated users (redirect logged-in users away)
const AUTH_ROUTES = ["/signin", "/login", "/onboarding"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check token from cookie (preferred, set server-side) or allow client-side check
  const token = req.cookies.get("jb_token")?.value;

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !token) {
    const loginUrl = new URL("/signin/creative", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/tell-us/:path*",
    "/brand-profile/:path*",
    "/dashboard/:path*",
    "/board/:path*",
    "/signin/:path*",
  ],
};
