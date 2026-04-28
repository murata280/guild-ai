// GUILD AI — Trust Score core calculation.
// Spec: docs/マスター設計図.md §4 + docs/用語集.md.
// Score = 0.5 * qualityHistory + 0.3 * discordContribution + 0.2 * xAmplification.

import type { Rank, TrustScoreInput, TrustScoreResult } from "@/types";

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

export function computeTrustScore(input: TrustScoreInput): TrustScoreResult {
  const q = clamp(input.qualityHistory);
  const d = clamp(input.discordContribution);
  const x = clamp(input.xAmplification);
  const raw = 0.5 * q + 0.3 * d + 0.2 * x; // 0-100
  const score = Math.round(raw * 10); // 0-1000
  const rank: Rank = raw >= 80 ? "S" : raw >= 60 ? "A" : "B";
  return { raw: Math.round(raw * 100) / 100, score, rank, updatedAt: new Date().toISOString() };
}
