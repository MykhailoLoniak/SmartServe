"use server";

import { redirect } from "next/navigation";

import { login, logout } from "@/lib/auth";
import { isAppError, toPublicError, type PublicError } from "@/lib/errors";
import { captureException } from "@/lib/monitoring";

type LoginActionState = { error?: PublicError };

const resolveSafeRedirectPath = (rawPath: string) => {
  if (!rawPath.startsWith("/") || rawPath.startsWith("//")) {
    return "/admin/restaurants";
  }

  return rawPath;
};

export async function loginAction(_prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin/restaurants");

  try {
    await login({ email, password });
  } catch (error) {
    if (isAppError(error)) {
      return { error: toPublicError(error, "Could not sign in") };
    }

    captureException(error, { action: "loginAction" });
    return { error: toPublicError(error, "Could not sign in") };
  }

  redirect(resolveSafeRedirectPath(next));
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}
