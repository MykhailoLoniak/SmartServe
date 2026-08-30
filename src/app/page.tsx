import Link from "next/link";
import { number } from "zod/v4";

export default function Home() {
return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4">
      <div className="max-w-xl rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-black">SmartServe</h1>
        <p className="mt-3 text-black/70">
          Скануйте QR-код на столику або відкрийте сторінку меню у форматі <code>/restoran-slug/table/5</code>.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/admin/restaurants" className="inline-flex rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">
            Керування ресторанами
          </Link>
          <Link
            href="/admin/qr"
            className="inline-flex rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Відкрити генератор посилань
          </Link>
        </div>
      </div>
    </div>
  );
}
