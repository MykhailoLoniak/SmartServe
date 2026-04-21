"use server";

import { redirect } from "next/navigation";

import { isAppError } from "@/lib/errors";
import { login, logout } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin/restaurants");

  try {
    await login({ email, password });
  } catch (error) {
    if (isAppError(error)) {
      return { error: error.message };
    }
    return { error: "Не вдалося виконати вхід" };
  }

  redirect(next.startsWith("/") ? next : "/admin/restaurants");
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}
