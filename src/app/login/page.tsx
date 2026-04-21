import LoginForm from "@/components/LoginForm";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4">
      <LoginForm next={next ?? "/admin/restaurants"} />
    </main>
  );
}
