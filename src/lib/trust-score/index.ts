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

// ─── Floor Price Guard ────────────────────────────────────────────────────────

/**
 * Compute the minimum acceptable listing price based on rank, rating count,
 * and a base price. High-trust / high-rated assets command a higher floor.
 *
 * Formula: basePrice × rankMultiplier × ratingBonus
 *   rankMultiplier: S=1.5, A=1.2, B=1.0
 *   ratingBonus: 1 + min(ratingCount, 20) * 0.01  (up to +20% for 20+ ratings)
 */
export function computeFloorPrice(
  rank: Rank,
  ratingCount: number,
  basePrice: number,
): number;
/**
 * Legacy two-arg overload used in ai-auditor: (suggestedPrice, trustScore 0-1000).
 * Returns floor = suggestedPrice × (0.8 + trustScore / 5000).
 */
export function computeFloorPrice(suggestedPrice: number, trustScore: number): number;
export function computeFloorPrice(
  rankOrPrice: Rank | number,
  ratingCountOrTrust: number,
  basePrice?: number,
): number {
  if (typeof rankOrPrice === "string") {
    const rank = rankOrPrice;
    const ratingCount = ratingCountOrTrust;
    const base = basePrice ?? 1000;
    const rankMul = rank === "S" ? 1.5 : rank === "A" ? 1.2 : 1.0;
    const ratingBonus = 1 + Math.min(ratingCount, 20) * 0.01;
    return Math.round(base * rankMul * ratingBonus);
  }
  // Legacy overload
  const suggestedPrice = rankOrPrice;
  const trustScore = ratingCountOrTrust;
  const multiplier = 0.8 + clamp(trustScore, 0, 1000) / 5000;
  return Math.round(suggestedPrice * multiplier);
}
