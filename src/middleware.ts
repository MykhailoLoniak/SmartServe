import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/admin", "/staff"];

const isProtectedPath = (pathname: string) => {
  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }

  const [, maybeSlug, section] = pathname.split("/");
  return Boolean(maybeSlug && ["admin", "staff"].includes(section ?? ""));
};

const unauthorizedResponse = () =>
  new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="SmartServe"',
    },
  });

const verifyCredentials = (authorization: string | null) => {
  if (!authorization?.startsWith("Basic ")) {
    return false;
  }

  try {
    const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf-8");
    const [username, password] = decoded.split(":");

    return (
      (username === process.env.SMARTSERVE_ADMIN_USERNAME && password === process.env.SMARTSERVE_ADMIN_PASSWORD) ||
      (username === process.env.SMARTSERVE_STAFF_USERNAME && password === process.env.SMARTSERVE_STAFF_PASSWORD)
    );
  } catch {
    return false;
  }
};

export function middleware(request: NextRequest) {
  if (!isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (!verifyCredentials(request.headers.get("authorization"))) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/:restaurantSlug/admin/:path*", "/:restaurantSlug/staff/:path*"],
};
