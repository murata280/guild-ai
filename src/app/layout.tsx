import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "GUILD AI — 知能資産の登記と信用の循環経済圏",
  description: "知能を労働ではなく登記する。信用は減衰せず循環する。"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-kami text-kuroko font-sans antialiased">
        <header className="sticky top-0 z-10 border-b border-kuroko/10 bg-kami/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight text-kuroko">
              GUILD AI
            </Link>
            <nav className="flex gap-5 text-sm font-medium text-kuroko/70">
              <Link href="/marketplace" className="hover:text-kuroko">
                Marketplace
              </Link>
              <Link href="/sell" className="hover:text-kuroko">
                Sell
              </Link>
              <Link href="/dashboard" className="hover:text-kuroko">
                Dashboard
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
