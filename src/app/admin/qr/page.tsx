"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export default function AdminQrPage() {
  const [tableInput, setTableInput] = useState("1");
  const [origin, setOrigin] = useState("https://domain.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const parsedTableId = Number(tableInput);
  const isValidTableId = Number.isInteger(parsedTableId) && parsedTableId > 0;

  const tableUrl = useMemo(() => {
    if (!isValidTableId) {
      return "";
    }

    return `${origin}/table/${parsedTableId}`;
  }, [isValidTableId, origin, parsedTableId]);

  const qrImageUrl = useMemo(() => {
    if (!tableUrl) {
      return "";
    }

    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(tableUrl)}`;
  }, [tableUrl]);

  return (
    <div className="min-h-screen bg-[#f7f7f8] px-4 py-10 md:px-8">
      <main className="mx-auto max-w-2xl rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-2xl font-bold text-black md:text-3xl">QR-генератор для столиків</h1>
        <p className="mt-2 text-black/60">Введіть номер столика, щоб отримати посилання на меню та готовий QR-код.</p>

        <label htmlFor="table-number" className="mt-6 block text-sm font-medium text-black/80">
          Номер столика
        </label>
        <input
          id="table-number"
          type="number"
          min={1}
          value={tableInput}
          onChange={(event) => setTableInput(event.target.value)}
          className="mt-2 w-full rounded-xl border border-black/20 px-4 py-2 outline-none focus:border-black"
          placeholder="Наприклад, 5"
        />

        {isValidTableId ? (
          <div className="mt-6 rounded-2xl border border-black/10 bg-[#fdfdfd] p-5">
            <p className="text-sm text-black/60">Посилання для QR:</p>
            <a href={tableUrl} className="mt-1 block break-all font-medium text-black underline" target="_blank" rel="noreferrer">
              {tableUrl}
            </a>

            <div className="mt-4 inline-flex rounded-2xl border border-black/10 bg-white p-3">
              <Image src={qrImageUrl} alt={`QR-код для столика ${parsedTableId}`} width={220} height={220} unoptimized />
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-red-600">Вкажіть коректний номер столика (ціле число більше 0).</p>
        )}
      </main>
    </div>
  );
}
