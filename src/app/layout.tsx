import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "SmartServe", template: "%s · SmartServe" },
  description: "Restaurant automation platform: QR menus, kitchen operations, service, and analytics.",
  openGraph: {
    title: "SmartServe",
    description: "QR ordering and operational tools for restaurants.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

// CSP nonces are generated per request in middleware, so the app shell must be rendered dynamically.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
