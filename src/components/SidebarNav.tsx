"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Nav item definitions ─────────────────────────────────────────────────────
// terminal labels / kawaii labels — theme-aware at runtime
// 内部参照リンク：保管庫(/marketplace)・おさいふ通帳(/wallet) は footer から参照可

const NAV_ITEMS = [
  { href: "/",      terminalLabel: "Home",                    kawaiiLabel: "🏠 ホーム",           exact: true  },
  { href: "/bank",  terminalLabel: "資産運用ターミナル",       kawaiiLabel: "🐦 シマエナガ銀行",   exact: false },
  { href: "/jobs",  terminalLabel: "Engagement Terminal",     kawaiiLabel: "💼 案件ボード",        exact: false },
  { href: "/guild", terminalLabel: "Portfolio",               kawaiiLabel: "⚔️ 武器庫",           exact: false },
  { href: "/sell",  terminalLabel: "Lodge",                   kawaiiLabel: "➕ 登録（出品）",      exact: false },
  { href: "/wallet",terminalLabel: "Passbook",                kawaiiLabel: "💰 通帳・お知らせ",   exact: false },
];

// Bottom nav uses shorter labels
const BOTTOM_ITEMS = [
  { href: "/",       terminalLabel: "Home",      kawaiiLabel: "ホーム",  exact: true  },
  { href: "/bank",   terminalLabel: "Terminal",  kawaiiLabel: "🐦 銀行", exact: false },
  { href: "/jobs",   terminalLabel: "Engage",    kawaiiLabel: "💼 案件", exact: false },
  { href: "/guild",  terminalLabel: "Portfolio", kawaiiLabel: "⚔️ 武器庫", exact: false },
  { href: "/sell",   terminalLabel: "Lodge",     kawaiiLabel: "➕ 登録", exact: false },
  { href: "/wallet", terminalLabel: "Passbook",  kawaiiLabel: "💰 通帳", exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function useThemeAttr(): "terminal" | "other" {
  if (typeof document === "undefined") return "terminal";
  const t = document.documentElement.getAttribute("data-theme");
  return t === "terminal" || t === "pro" ? "terminal" : "other";
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-all duration-100 active:scale-[0.98] rounded-[var(--radius-md,8px)] ${
              active
                ? "bg-[var(--t-gold-glow,rgba(26,107,181,0.10))] text-[var(--t-gold,#1A6BB5)] font-bold"
                : "text-[var(--text-muted,#4A4464)] hover:bg-[rgba(0,0,0,0.04)]"
            }`}
          >
            {/* Terminal label (data-theme=terminal or pro) */}
            <span className="hidden [data-theme=terminal]_&:block [data-theme=pro]_&:block font-mono text-xs uppercase tracking-widest">
              {item.terminalLabel}
            </span>
            {/* Kawaii label (data-theme=kawaii or default) */}
            <span className="[data-theme=terminal]_&:hidden [data-theme=pro]_&:hidden">
              {item.kawaiiLabel}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden border-t border-[var(--divider,rgba(26,22,40,0.10))] bg-[var(--obsidian-2,#FAFAFA)] flex h-14 flex-shrink-0">
      {BOTTOM_ITEMS.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col items-center justify-center flex-1 min-w-0 gap-0.5 py-1 active:scale-[0.98] transition-colors ${
              active
                ? "text-[var(--t-gold,#1A6BB5)]"
                : "text-[var(--text-muted,#9890A8)]"
            }`}
          >
            {/* terminal label */}
            <span className="hidden [data-theme=terminal]_&:block [data-theme=pro]_&:block text-[9px] font-mono uppercase tracking-widest">
              {item.terminalLabel}
            </span>
            {/* kawaii label */}
            <span className="[data-theme=terminal]_&:hidden [data-theme=pro]_&:hidden text-[10px] font-medium">
              {item.kawaiiLabel}
            </span>
            {active && (
              <span className="absolute bottom-1.5 w-4 h-0.5 rounded-full bg-[var(--t-gold,#1A6BB5)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
