import { auth } from "~/server/auth";

export default auth((req) => {
  // req.auth
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

  // Redirect to signin if trying to access protected route and not logged in
  if (nextUrl.pathname.startsWith("/protected") && !isLoggedIn) {
    // Construct the sign-in URL with a callback URL
    const signInUrl = new URL("/api/auth/signin", nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return Response.redirect(signInUrl);
  }

  // If logged in and trying to access signin page, redirect to home
  if (isLoggedIn && nextUrl.pathname.startsWith("/auth/signin")) {
    return Response.redirect(new URL("/", nextUrl.origin));
  }

  // Allow request to proceed
  return undefined;
});

// Optionally, don't invoke Middleware on some paths
// Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: ["/protected/:path*", "/auth/signin"],
};
