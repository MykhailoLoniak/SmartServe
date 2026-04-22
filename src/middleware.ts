import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/table", "/restaurants"];
const SESSION_COOKIE_NAME = "smartserve_session";

const isPublicPath = (pathname: string) => PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

const isProtectedPath = (pathname: string) =>
  pathname.startsWith("/admin") || pathname.startsWith("/staff") || pathname.includes("/admin/") || pathname.includes("/staff/");

const createNonce = () => btoa(crypto.randomUUID());

const buildCsp = (nonce: string) => {
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data:",
    `connect-src 'self'${process.env.NODE_ENV === "development" ? " ws: wss:" : ""}`,
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ];

  return directives.join("; ");
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = createNonce();
  const csp = buildCsp(nonce);
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  if (isPublicPath(pathname) || pathname.startsWith("/_next") || pathname.startsWith("/api/health") || pathname === "/favicon.ico") {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("x-nonce", nonce);
    return response;
  }

  if (!isProtectedPath(pathname)) {
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("x-nonce", nonce);
    return response;
  }

  // Middleware in Edge runtime works only as coarse UX redirect.
  // Real authorization is enforced server-side in requireAuth/requirePermission guards.
  if (!request.cookies.get(SESSION_COOKIE_NAME)?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.headers.set("Content-Security-Policy", csp);
    response.headers.set("x-nonce", nonce);
    return response;
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("x-nonce", nonce);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
