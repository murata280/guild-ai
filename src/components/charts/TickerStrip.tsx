"use client";

import { useEffect, useRef } from "react";
import type { TickerItem } from "@/lib/terminal-data";

interface TickerStripProps {
  items: TickerItem[];
}

export function TickerStrip({ items }: TickerStripProps) {
  return (
    <div
      role="region"
      aria-label="ティッカー — 資産スコア概況"
      className="overflow-x-auto scrollbar-none border-b border-[var(--divider,#2A2F38)]"
    >
      <div className="flex gap-0 min-w-max">
        {items.map((item, i) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-4 py-2 border-r border-[var(--divider,#2A2F38)] last:border-r-0 shrink-0"
          >
            <span className="text-[10px] font-mono text-[var(--text-muted,#98A1B0)] tabular-nums tracking-widest uppercase">
              {item.id}
            </span>
            <span className="text-xs font-mono text-[var(--text-primary,#E8EBF0)] tabular-nums font-bold">
              {item.score.toLocaleString()}
            </span>
            <span
              className={`text-[10px] font-mono tabular-nums font-semibold ${
                item.delta >= 0 ? "text-positive" : "text-negative"
              }`}
              aria-label={`${item.delta >= 0 ? "+" : ""}${item.delta}%`}
            >
              {item.delta >= 0 ? "▲" : "▼"}{Math.abs(item.delta).toFixed(1)}%
            </span>
            <span className="text-[10px] font-mono text-[var(--t-gold,#D4AF37)] tabular-nums">
              {item.yield.toFixed(1)}% YLD
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
