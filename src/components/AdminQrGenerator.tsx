"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type TableOption = {
  id: number;
  number: number;
  qrSlug: string;
};

type AdminQrGeneratorProps = {
  tables: TableOption[];
  restaurantSlug: string;
  appUrlFromEnv?: string;
};

export default function AdminQrGenerator({ tables, restaurantSlug, appUrlFromEnv }: AdminQrGeneratorProps) {
  const [selectedTableId, setSelectedTableId] = useState<number | null>(tables[0]?.id ?? null);
  const [origin, setOrigin] = useState(appUrlFromEnv ?? "");

  useEffect(() => {
    if (appUrlFromEnv) {
      return;
    }

    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, [appUrlFromEnv]);

  const tableUrl = useMemo(() => {
    if (!selectedTableId || !origin) {
      return "";
    }

    const table = tables.find((item) => item.id === selectedTableId);
    return table ? `${origin}/${restaurantSlug}/table/${table.qrSlug}` : "";
  }, [origin, restaurantSlug, selectedTableId, tables]);

  const qrImageUrl = useMemo(() => {
    if (!tableUrl) {
      return "";
    }

    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(tableUrl)}`;
  }, [tableUrl]);

  return (
    <main className="mx-auto max-w-2xl rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-8">
      <h1 className="text-2xl font-bold text-black md:text-3xl">QR-генератор для столиків</h1>
      <p className="mt-2 text-black/60">Оберіть столик зі списку, щоб отримати посилання на меню та готовий QR-код.</p>

      <label htmlFor="table-id" className="mt-6 block text-sm font-medium text-black/80">
        Столик
      </label>

      <select
        id="table-id"
        value={selectedTableId ?? ""}
        onChange={(event) => setSelectedTableId(Number(event.target.value))}
        className="mt-2 w-full rounded-xl border border-black/20 px-4 py-2 outline-none focus:border-black"
      >
        {tables.map((table) => (
          <option key={table.id} value={table.id}>
            Стіл #{table.number} (ID: {table.id})
          </option>
        ))}
      </select>

      {tableUrl ? (
        <div className="mt-6 rounded-2xl border border-black/10 bg-[#fdfdfd] p-5">
          <p className="text-sm text-black/60">Посилання для QR:</p>
          <a href={tableUrl} className="mt-1 block break-all font-medium text-black underline" target="_blank" rel="noreferrer">
            {tableUrl}
          </a>

          <div className="mt-4 inline-flex rounded-2xl border border-black/10 bg-white p-3">
            <Image src={qrImageUrl} alt={`QR-код для столика ID ${selectedTableId}`} width={220} height={220} unoptimized />
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-red-600">Немає базового URL застосунку. Вкажіть NEXT_PUBLIC_APP_URL у .env.</p>
      )}
    </main>
  );
}
