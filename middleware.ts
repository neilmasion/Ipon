import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "./lib/security";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("ipon_token")?.value;
  const { pathname } = request.nextUrl;
  const method = request.method;

  // 1. CSRF & Same-Origin Protection for mutation requests (#14 & #15)
  if (pathname.startsWith("/api/") && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    if (origin && host) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json(
            { error: "Forbidden: Cross-site request forgery detected" },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Invalid Origin header" },
          { status: 400 }
        );
      }
    }
  }

  // 2. Rate Limiting (#11)
  if (pathname.startsWith("/api/")) {
    const clientIp = 
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const isAuthRoute = pathname.startsWith("/api/auth/");
    const limitKey = `${clientIp}:${isAuthRoute ? "auth" : "api"}`;
    const maxRequests = isAuthRoute ? 15 : 150; // 15 auth attempts / 150 general api per minute

    const rateResult = checkRateLimit(limitKey, maxRequests, 60);

    if (!rateResult.allowed) {
      const response = NextResponse.json(
        { 
          error: "Too many requests. Please slow down and try again later.",
          retryAfter: rateResult.reset
        },
        { status: 429 }
      );
      response.headers.set("Retry-After", String(rateResult.reset));
      return response;
    }
  }

  // 3. Admin Routes Protection (#4 Protect Admin Routes)
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Block admin access by default if not an admin
    return NextResponse.json(
      { error: "Access Denied: Administrator privilege required." },
      { status: 403 }
    );
  }

  // 4. Public paths that do not require authentication (#5 Add Auth)
  const isPublicPath =
    pathname === "/" && !token ? false : // Root requires auth unless on public pages
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/verify") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico");

  // If unauthenticated and accessing a protected page, redirect to /login
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  // Add defense-in-depth security headers (#17 Security Headers)
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
