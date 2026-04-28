// GUILD AI — ai-auditor (知能鑑定士)
// Decides S/A/B rank from CCAF + Vercel uptime.
// Spec: docs/マスター設計図.md §3 and docs/用語集.md.
// "魂の登記" guard: AI-only generations (no human intent signals) cannot reach S.

import type { AuditResult, CCAF, Rank } from "@/types";

export interface AuditInput {
  ccaf: CCAF;
  vercelUptimeDays: number;
}

const S_THRESHOLD = { density: 80, uptime: 30 } as const;
const A_THRESHOLD = { density: 60, uptime: 7 } as const;

export function audit(input: AuditInput): AuditResult {
  const { ccaf, vercelUptimeDays } = input;
  const reasons: string[] = [];

  const hasIntent = ccaf.intentSignals.length > 0;

  let rank: Rank = "B";
  if (
    ccaf.thoughtDensity >= S_THRESHOLD.density &&
    vercelUptimeDays >= S_THRESHOLD.uptime &&
    hasIntent
  ) {
    rank = "S";
    reasons.push("魂の登記: thoughtDensity ≥ 80, uptime ≥ 30d, intent signals present");
  } else if (
    ccaf.thoughtDensity >= A_THRESHOLD.density &&
    vercelUptimeDays >= A_THRESHOLD.uptime
  ) {
    rank = "A";
    reasons.push("A rank: thoughtDensity ≥ 60, uptime ≥ 7d");
    if (!hasIntent) reasons.push("Intent signals missing — capped at A (no 魂の登記)");
  } else {
    rank = "B";
    reasons.push("B rank: baseline guarantee");
  }

  // Composite 0-100 score: density 60% + uptime (capped 60d) 30% + intent boost 10%
  const uptimePart = Math.min(vercelUptimeDays, 60) / 60; // 0..1
  const intentPart = hasIntent ? 1 : 0;
  const composite =
    0.6 * ccaf.thoughtDensity +
    0.3 * (uptimePart * 100) +
    0.1 * (intentPart * 100);

  return {
    rank,
    score: Math.round(composite * 100) / 100,
    reasons
  };
}

/**
 * Compute Floor Price from base price and Trust Score (0-1000).
 * floorPrice = basePrice * (1 + score/2000) — capped at +50%.
 */
export function computeFloorPrice(basePrice: number, trustScore: number): number {
  const ratio = 1 + Math.min(trustScore, 1000) / 2000;
  return Math.round(basePrice * ratio * 100) / 100;
}
