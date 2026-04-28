import type { ReactNode } from "react";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { SidebarNav, BottomNav } from "@/components/SidebarNav";
import { OnboardingGuide } from "@/components/OnboardingGuide";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-jp",
  display: "swap",
  weight: ["400", "500", "700", "900"],
});

const BASE_URL = "https://guild-ai.vercel.app";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: "GUILD AI — スキルを資産に。AIが買いに来る。",
  description: "あなたのスキルやコードを資産として登録すると、世界中の人やAIが利用料を払って使ってくれます。寝ている間も、あなたの分身が稼ぎ続ける場所。",
  openGraph: {
    title: "GUILD AI — スキルを資産に。AIが買いに来る。",
    description: "スキルを登録したら、AIが勝手に値段をつけた。思考の深さと試行回数が、そのまま評価に反映される。",
    url: BASE_URL,
    siteName: "GUILD AI",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "GUILD AI" }],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GUILD AI — スキルを資産に。AIが買いに来る。",
    description: "スキルを登録したら、AIが勝手に値段をつけた。思考の深さと試行回数が、そのまま評価に反映される。",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="h-screen h-dvh flex bg-kami overflow-hidden text-kuroko font-sans antialiased">

        {/* ── Desktop sidebar ───────────────────────────────── */}
        <aside className="hidden lg:flex w-52 flex-shrink-0 flex-col border-r border-kuroko/10 bg-surface-inset">
          {/* Logo */}
          <div className="h-14 flex items-center gap-2.5 px-4 border-b border-kuroko/10 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-kaki flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-black tracking-wider">G</span>
            </div>
            <span className="text-sm font-bold text-kuroko">GUILD AI</span>
          </div>
          {/* Nav links (client component for active state) */}
          <SidebarNav />
          {/* Footer hint */}
          <div className="px-4 py-4 border-t border-kuroko/10 flex-shrink-0">
            <p className="text-xs text-[#9890A8] leading-relaxed">
              良質な知能を出品すると売れる。
            </p>
          </div>
        </aside>

        {/* ── Right column ──────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Mobile header */}
          <header className="lg:hidden h-14 flex items-center justify-between px-4 border-b border-kuroko/10 glass-header z-40 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-kaki flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-black">G</span>
              </div>
              <span className="text-sm font-bold text-kuroko">GUILD AI</span>
            </div>
          </header>

          {/* Scrollable page content */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain">
            {children}
          </div>

          {/* Mobile bottom nav */}
          <BottomNav />
        </div>

        {/* Onboarding guide — renders only on first visit */}
        <OnboardingGuide />

      </body>
    </html>
  );
}
