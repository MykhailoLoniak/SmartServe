import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME } from "./authTypes";

const isSecureCookie = process.env.NODE_ENV === "production";

export const getSessionCookieOptions = (expiresAt: Date) => ({
  httpOnly: true as const,
  secure: isSecureCookie,
  sameSite: "lax" as const,
  path: "/",
  expires: expiresAt,
});

export async function readSessionTokenFromCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function writeSessionCookie(rawToken: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, getSessionCookieOptions(expiresAt));
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}
