"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 6-item main nav — 保管庫(/marketplace)・通帳(/wallet) は内部参照リンクとして残す
const SIDEBAR_ITEMS = [
  { href: "/", label: "🏠 ホーム", exact: true },
  { href: "/bank", label: "🐦 シマエナガ銀行", exact: false },
  { href: "/jobs", label: "💼 案件ボード", exact: false },
  { href: "/guild", label: "⚔️ 武器庫", exact: false },
  { href: "/sell", label: "➕ 登録（出品）", exact: false },
  { href: "/wallet", label: "💰 通帳・お知らせ", exact: false },
];

const BOTTOM_ITEMS = [
  { href: "/", label: "ホーム", exact: true },
  { href: "/bank", label: "🐦 銀行", exact: false },
  { href: "/jobs", label: "💼 案件", exact: false },
  { href: "/guild", label: "⚔️ 武器庫", exact: false },
  { href: "/sell", label: "➕ 登録", exact: false },
  { href: "/wallet", label: "💰 通帳", exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
      {SIDEBAR_ITEMS.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 active:scale-[0.98] ${
              active
                ? "bg-kaki/10 text-kaki"
                : "text-[#4A4464] hover:bg-kuroko/[0.04]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden border-t border-kuroko/10 bg-kami flex h-14 flex-shrink-0">
      {BOTTOM_ITEMS.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col items-center justify-center flex-1 min-w-0 gap-0.5 py-1 active:scale-[0.98] transition-colors ${
              active ? "text-kaki" : "text-[#9890A8]"
            }`}
          >
            <span className="text-[10px] font-medium">{item.label}</span>
            {active && (
              <span className="absolute bottom-1.5 w-4 h-0.5 rounded-full bg-kaki" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
