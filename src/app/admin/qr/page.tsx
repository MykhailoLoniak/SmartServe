import AdminQrGenerator from "@/components/AdminQrGenerator";
import { prisma } from "@/lib/prisma";

export default async function AdminQrPage() {
  const tables = await prisma.table.findMany({
    orderBy: [{ restaurantId: "asc" }, { number: "asc" }],
    select: {
      id: true,
      number: true,
    },
  });

  return (
    <div className="min-h-screen bg-[#f7f7f8] px-4 py-10 md:px-8">
      {tables.length > 0 ? (
        <AdminQrGenerator tables={tables} appUrlFromEnv={process.env.NEXT_PUBLIC_APP_URL} />
      ) : (
        <main className="mx-auto max-w-2xl rounded-3xl border border-black/10 bg-white p-6 text-center shadow-sm md:p-8">
          <h1 className="text-2xl font-bold text-black md:text-3xl">QR-генератор для столиків</h1>
          <p className="mt-3 text-black/60">У базі даних поки немає жодного столика.</p>
        </main>
      )}
    </div>
  );
}
