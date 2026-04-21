import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

type TableLegacyPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TableLegacyPage({ params }: TableLegacyPageProps) {
  const { id } = await params;
  const tableId = Number(id);
  const isValidTableId = Number.isInteger(tableId) && tableId > 0;

  if (!isValidTableId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Некоректний номер столика</h1>
          <p className="mt-2 text-black/60">Перевірте QR-код або посилання та спробуйте ще раз.</p>
        </div>
      </div>
    );
  }

  const table = await prisma.table.findUnique({
    where: { id: tableId },
    select: {
      id: true,
      restaurant: {
        select: {
          slug: true,
        },
      },
    },
  });

  if (!table) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Столик не знайдено</h1>
          <p className="mt-2 text-black/60">Цей QR-код більше неактивний або веде на неіснуючий столик.</p>
        </div>
      </div>
    );
  }

  redirect(`/${table.restaurant.slug}/table/${table.id}`);
}
