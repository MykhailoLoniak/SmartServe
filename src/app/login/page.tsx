import { loginAction } from "@/app/actions/authActions";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4">
      <form action={loginAction} className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-black">SmartServe Login</h1>
        <p className="mt-2 text-sm text-black/60">Увійдіть через production session auth.</p>
        <input type="hidden" name="next" value={next ?? "/admin/restaurants"} />

        <label className="mt-6 block text-sm font-medium text-black">
          Email
          <input name="email" type="email" required className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2" />
        </label>

        <label className="mt-4 block text-sm font-medium text-black">
          Password
          <input name="password" type="password" required minLength={8} className="mt-1 w-full rounded-lg border border-black/20 px-3 py-2" />
        </label>

        <button type="submit" className="mt-6 w-full rounded-lg bg-black px-4 py-2 font-medium text-white">
          Увійти
        </button>
      </form>
    </main>
  );
}
