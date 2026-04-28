import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "GUILD AI — 知能資産の登記と信用の循環経済圏",
  description: "知能を労働ではなく登記する。信用は減衰せず循環する。"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-kami text-kuroko font-sans antialiased">{children}</body>
    </html>
  );
}
