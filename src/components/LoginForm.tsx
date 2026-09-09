"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/actions/authActions";

type LoginActionState = Awaited<ReturnType<typeof loginAction>>;

const INITIAL_STATE: LoginActionState = { error: undefined };

export default function LoginForm({ next }: { next: string }) {
  const [state, action, isPending] = useActionState(loginAction, INITIAL_STATE);

  return (
    <form action={action} className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-black">SmartServe Login</h1>
      <p className="mt-2 text-sm text-black/60">Sign in using production session authentication.</p>
      <input type="hidden" name="next" value={next} />

      {state?.error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" data-error-type={state.error.type}>
          {state.error.message}
        </p>
      ) : null}

      <label className="mt-6 block text-sm font-medium text-black">
        Email
        <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2" />
      </label>

      <label className="mt-4 block text-sm font-medium text-black">
        Password
        <input name="password" type="password" required minLength={8} className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2" />
      </label>

      <button type="submit" disabled={isPending} className="mt-6 w-full rounded-lg bg-black px-4 py-2 font-medium text-white disabled:opacity-60">
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
