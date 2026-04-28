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
  S: "bg-kaki text-white",
  A: "bg-zinc-300 text-kuroko",
  B: "bg-amber-700 text-white"
};

export function TrustScore({ input, ownerName = "Owner", className = "" }: TrustScoreProps) {
  const result = useMemo(() => computeTrustScore(input), [input]);

  return (
    <section
      className={`section-card p-5 ${className}`}
      aria-label="Trust Score"
    >
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-[#9890A8]">Trust Score</p>
          <h3 className="text-sm font-semibold text-kuroko mt-0.5">{ownerName}</h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${rankColor[result.rank]}`}
          aria-label={`Rank ${result.rank}`}
        >
          {result.rank}
        </span>
      </header>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-4xl font-bold text-kuroko tabular-nums">{result.score}</span>
        <span className="text-sm text-[#9890A8]">/ 1000</span>
      </div>

      <dl className="mt-4 space-y-2.5">
        <Bar label="ひんしつ れきし" value={input.qualityHistory} weight={0.5} />
        <Bar label="Discord こうけん" value={input.discordContribution} weight={0.3} />
        <Bar label="X かくさん" value={input.xAmplification} weight={0.2} />
      </dl>

      <p className="mt-3 text-[11px] text-[#9890A8]">
        さいしん こうしん: {new Date(result.updatedAt).toLocaleString("ja-JP")}
      </p>
    </section>
  );
}

function Bar({ label, value, weight }: { label: string; value: number; weight: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex justify-between text-xs text-[#4A4464]">
        <dt>
          {label} <span className="text-[#9890A8]">×{weight}</span>
        </dt>
        <dd className="tabular-nums font-medium">{Math.round(pct)}</dd>
      </div>
      <div className="mt-1 h-1.5 w-full rounded-full bg-kuroko/10">
        <div
          className="h-1.5 rounded-full bg-kaki"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}

export default TrustScore;
