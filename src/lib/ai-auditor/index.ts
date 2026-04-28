// GUILD AI — ai-auditor (知能鑑定士)
// Decides S/A/B rank from CCAF + Vercel uptime.

import type { AuditResult, CCAF, Rank } from "@/types";

export interface AuditInput {
  ccaf: CCAF;
  vercelUptimeDays: number;
}

const S_THRESHOLD = { density: 80, uptime: 30 } as const;
const A_THRESHOLD = { density: 60, uptime: 7 } as const;

function buildJustification(ccaf: CCAF, vercelUptimeDays: number, rank: Rank): string {
  const signals = ccaf.intentSignals.length;
  return `思考密度${ccaf.thoughtDensity}、試行回数${ccaf.iterations}回、稼働実績${vercelUptimeDays}日、意思シグナル「${signals}個」により ${rank} ランクと判定。${
    rank === "S" ? "魂の登記基準を満たし最高格付けを付与。" :
    rank === "A" ? "高品質基準を満たす。意思シグナルを追加することでSランクへ昇格可能。" :
    "基準値を下回るが最低保証ランクを付与。思考密度と稼働日数を改善することでランクアップできる。"
  }`;
}

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

  const uptimePart = Math.min(vercelUptimeDays, 60) / 60;
  const intentPart = hasIntent ? 1 : 0;
  const composite =
    0.6 * ccaf.thoughtDensity +
    0.3 * (uptimePart * 100) +
    0.1 * (intentPart * 100);

  return {
    rank,
    score: Math.round(composite * 100) / 100,
    reasons,
    justification: buildJustification(ccaf, vercelUptimeDays, rank),
  };
}

/**
 * Promote an A-rank result to S by adding a voice intent signal.
 * Caller should provide the raw transcript from the user's voice input.
 */
export function promoteWithIntent(input: AuditInput, voiceLog: string): AuditResult {
  const base = audit(input);
  const promoted: CCAF = {
    ...input.ccaf,
    intentSignals: [...input.ccaf.intentSignals, "voice-intent"],
  };
  const boostedScore = Math.min(100, base.score + 15);
  const snippet = voiceLog.slice(0, 40).trim();
  return {
    rank: "S",
    score: boostedScore,
    reasons: [
      ...base.reasons,
      `意思シグナル追加: 「${snippet}${voiceLog.length > 40 ? "…" : ""}」により S ランクへ昇格`,
    ],
    justification: buildJustification(promoted, input.vercelUptimeDays, "S"),
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
