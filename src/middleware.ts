import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/table", "/restaurants"];
const SESSION_COOKIE_NAME = "smartserve_session";

const isPublicPath = (pathname: string) => PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

const isProtectedPath = (pathname: string) =>
  pathname.startsWith("/admin") || pathname.startsWith("/staff") || pathname.includes("/admin/") || pathname.includes("/staff/");

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname) || pathname.startsWith("/_next") || pathname.startsWith("/api/health")) {
    return NextResponse.next();
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // Middleware in Edge runtime works only as coarse UX redirect.
  // Real authorization is enforced server-side in requireAuth/requirePermission guards.
  if (!request.cookies.get(SESSION_COOKIE_NAME)?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
