"use client";

import type { StreamEntry } from "@/lib/terminal-data";

const TYPE_STYLES: Record<StreamEntry["type"], { label: string; color: string }> = {
  purchase: { label: "PURCHASE", color: "text-positive" },
  royalty:  { label: "ROYALTY",  color: "text-[var(--t-gold,#D4AF37)]" },
  deploy:   { label: "DEPLOY",   color: "text-[var(--t-muted,#98A1B0)]" },
  audit:    { label: "AUDIT",    color: "text-[#7AC8D4]" },
};

interface StreamFeedProps {
  entries: StreamEntry[];
}

function formatTs(iso: string): string {
  return iso.slice(11, 19); // HH:MM:SS
}

export function StreamFeed({ entries }: StreamFeedProps) {
  return (
    <div
      role="log"
      aria-label="取引ストリーム"
      aria-live="polite"
      className="font-mono text-[11px] overflow-hidden"
    >
      {entries.map((entry, i) => {
        const style = TYPE_STYLES[entry.type];
        const isNew = i < 3;
        return (
          <div
            key={entry.id}
            className={`flex items-center gap-2 px-3 py-[5px] border-b border-[var(--divider,#2A2F38)] last:border-b-0 ${
              isNew ? "bg-[var(--t-gold-glow,rgba(212,175,55,0.08))]" : ""
            }`}
            style={{ height: 22 }}
          >
            <span className="text-[var(--text-muted,#98A1B0)] tabular-nums shrink-0 w-16">
              {formatTs(entry.ts)}
            </span>
            <span className={`font-bold shrink-0 w-16 ${style.color}`}>
              {style.label}
            </span>
            <span className="text-[var(--text-primary,#E8EBF0)] truncate flex-1">
              {entry.label}
            </span>
            {entry.amount > 0 && (
              <span className="text-positive tabular-nums shrink-0 ml-2">
                +¥{entry.amount.toLocaleString("ja-JP")}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
