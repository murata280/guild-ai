"use client";

// GUILD AI — TrustScore UI component
// Renders the dynamic Trust Score (0-1000) along with rank badge and breakdown.
// Spec: docs/マスター設計図.md §4.

import { useMemo } from "react";
import type { TrustScoreInput } from "@/types";
import { computeTrustScore } from "@/lib/trust-score";

export interface TrustScoreProps {
  input: TrustScoreInput;
  ownerName?: string;
  className?: string;
}

const rankColor: Record<string, string> = {
  S: "bg-kaki text-kuroko",
  A: "bg-zinc-300 text-kuroko",
  B: "bg-amber-700 text-white"
};

export function TrustScore({ input, ownerName = "Owner", className = "" }: TrustScoreProps) {
  const result = useMemo(() => computeTrustScore(input), [input]);

  return (
    <section
      className={`rounded-2xl border border-kuroko/10 bg-kami p-5 shadow-sm ${className}`}
      aria-label="Trust Score"
    >
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-kuroko/60">Trust Score</p>
          <h3 className="text-lg font-semibold text-kuroko">{ownerName}</h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ${rankColor[result.rank]}`}
          aria-label={`Rank ${result.rank}`}
        >
          {result.rank}
        </span>
      </header>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-bold text-kuroko tabular-nums">{result.score}</span>
        <span className="text-kuroko/60">/ 1000</span>
      </div>

      <dl className="mt-4 space-y-2">
        <Bar label="品質履歴" value={input.qualityHistory} weight={0.5} />
        <Bar label="Discord 貢献" value={input.discordContribution} weight={0.3} />
        <Bar label="X 拡散" value={input.xAmplification} weight={0.2} />
      </dl>

      <p className="mt-3 text-[11px] text-kuroko/50">
        最終更新: {new Date(result.updatedAt).toLocaleString()}
      </p>
    </section>
  );
}

function Bar({ label, value, weight }: { label: string; value: number; weight: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex justify-between text-xs text-kuroko/70">
        <dt>
          {label} <span className="text-kuroko/40">×{weight}</span>
        </dt>
        <dd className="tabular-nums">{Math.round(pct)}</dd>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-kuroko/10">
        <div
          className="h-2 rounded-full bg-kuroko"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

export default TrustScore;
