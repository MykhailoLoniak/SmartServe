"use server";

import { redirect } from "next/navigation";

import { login, logout } from "@/lib/auth";
import { isAppError } from "@/lib/errors";
import { captureException } from "@/lib/monitoring";

type LoginActionState = { error?: string };

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
      return { error: error.message };
    }

    captureException(error, { action: "loginAction" });
    return { error: "Не вдалося виконати вхід" };
  }

  redirect(resolveSafeRedirectPath(next));
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}
