import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Get the token from the request with secure cookie configuration
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
    cookieName: "next-auth.session-token",
  });

  // Check if the user is authenticated
  const isAuthenticated = !!token;
  const { nextUrl } = request;
  const isAuthPage = nextUrl.pathname.startsWith("/auth/signin");
  const isProtectedRoute =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/chat") ||
    nextUrl.pathname.startsWith("/settings");

  // Redirect unauthenticated users from protected routes to sign in
  if (isProtectedRoute && !isAuthenticated) {
    const signInUrl = new URL("/auth/signin", nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If user is already authenticated and tries to access auth pages,
  // redirect to the callbackUrl if it exists, otherwise to the dashboard
  if (isAuthenticated && isAuthPage) {
    const callbackUrl = nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl && callbackUrl !== "/auth/signin") {
      return NextResponse.redirect(new URL(callbackUrl, nextUrl.origin));
    }
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin));
  }

  // For all other routes, proceed as normal
  return NextResponse.next();
}

// Optionally, don't invoke Middleware on some paths
// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/settings/:path*",
    "/auth/signin",
    "/api/chat/:path*",
  ],
};
