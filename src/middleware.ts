import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/table", "/restaurants"];
const SESSION_COOKIE_NAME = "smartserve_session";

const isPublicPath = (pathname: string) => PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

const isProtectedPath = (pathname: string) =>
  pathname.startsWith("/admin") || pathname.startsWith("/staff") || pathname.includes("/admin/") || pathname.includes("/staff/");

const createNonce = () => btoa(crypto.randomUUID());

const getSupabaseConnectSources = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return [];
  }

  try {
    const url = new URL(supabaseUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return [];
    }

    const websocketProtocol = url.protocol === "https:" ? "wss:" : "ws:";
    return [url.origin, `${websocketProtocol}//${url.host}`];
  } catch {
    return [];
  }
};

const buildCsp = (nonce: string) => {
  const isDevelopment = process.env.NODE_ENV === "development";
  const allowUnsafeInlineStylesInProduction = process.env.CSP_STYLE_UNSAFE_INLINE === "true";
  const styleSrc = isDevelopment || allowUnsafeInlineStylesInProduction ? "style-src 'self' 'unsafe-inline'" : `style-src 'self' 'nonce-${nonce}'`;
  const scriptSrc = `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`;
  const supabaseConnectSources = getSupabaseConnectSources();
  const connectSrc = ["connect-src 'self'", ...supabaseConnectSources, ...(isDevelopment ? ["ws:", "wss:"] : [])].join(" ");

  const directives = [
    "default-src 'self'",
    scriptSrc,
    styleSrc,
    "img-src 'self' blob: data: https://api.qrserver.com",
    connectSrc,
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
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
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
