import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

type TableLegacyPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TableLegacyPage({ params }: TableLegacyPageProps) {
  const { id } = await params;
  const tableToken = id;
  const isValidTableToken = tableToken.length >= 20 && tableToken.length <= 128;

  if (!isValidTableToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-black">Invalid table reference</h1>
          <p className="mt-2 text-black/60">Check the QR code or link and try again.</p>
        </div>
      </div>
    );
  }

  const table = await prisma.table.findUnique({
    where: { qrSlug: tableToken },
    select: {
      id: true,
      qrSlug: true,
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
          <h1 className="text-2xl font-bold text-black">Table not found</h1>
          <p className="mt-2 text-black/60">This QR code is inactive or points to a table that does not exist.</p>
        </div>
      </div>
    );
  }

  redirect(`/${table.restaurant.slug}/table/${table.qrSlug}`);
}
