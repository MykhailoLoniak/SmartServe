import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f8] px-4">
      <div className="max-w-xl rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-black">SmartServe</h1>
        <p className="mt-3 text-black/70">
          Scan the QR code at your table or open a menu page in this format: <code>/restoran-slug/table/5</code>.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/admin/restaurants" className="inline-flex rounded-xl bg-black px-4 py-2 text-sm font-medium text-white">
            Restaurant management
          </Link>
          <Link
            href="/admin/qr"
            className="inline-flex rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Open link generator
          </Link>
        </div>
      </div>
    </div>
  );
}
