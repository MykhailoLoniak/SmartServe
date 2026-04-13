import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4">
      <div className="max-w-xl rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-black">SmartServe</h1>
        <p className="mt-3 text-black/70">
          Скануйте QR-код на столику або відкрийте сторінку меню у форматі <code>/table/5</code>.
        </p>
        <Link
          href="/admin/qr"
          className="mt-6 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Відкрити генератор посилань
        </Link>
      </div>
    </div>
  );
}
