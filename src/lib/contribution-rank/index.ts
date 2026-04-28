// GUILD AI — Contribution Rank
// Computes the 5-tier "知能貢献ランク" from local activity counters.

export type ContributionRank = "Newcomer" | "Riser" | "Creator" | "Pro Creator" | "Legendary";

export interface RankInput {
  ownedCount: number;
  salesCount: number;
  listingCount: number;
  apiCalls: number;
}

export interface RankResult {
  rank: ContributionRank;
  score: number;
  progress: number; // 0-100 toward next rank
  nextRank: ContributionRank | null;
  nextAction: string;
}

// Weighted scoring
export function computeScore(input: RankInput): number {
  return (
    input.ownedCount * 5 +
    input.salesCount * 10 +
    input.listingCount * 15 +
    input.apiCalls
  );
}

const TIERS: { rank: ContributionRank; min: number }[] = [
  { rank: "Legendary",   min: 100 },
  { rank: "Pro Creator", min: 60 },
  { rank: "Creator",     min: 30 },
  { rank: "Riser",       min: 10 },
  { rank: "Newcomer",    min: 0 },
];

export function computeContributionRank(input: RankInput): RankResult {
  const score = computeScore(input);

  const idx = TIERS.findIndex((t) => score >= t.min);
  const current = TIERS[idx];
  const nextEntry = idx > 0 ? TIERS[idx - 1] : null;

  const lowerBound = current.min;
  const upperBound = nextEntry?.min ?? lowerBound + 40;
  const progress = nextEntry === null
    ? 100
    : Math.min(100, Math.round(((score - lowerBound) / (upperBound - lowerBound)) * 100));

  return {
    rank: current.rank,
    score,
    progress,
    nextRank: nextEntry?.rank ?? null,
    nextAction: buildNextAction(input, nextEntry?.rank ?? null, nextEntry ? nextEntry.min - score : 0),
  };
}

function buildNextAction(
  input: RankInput,
  nextRank: ContributionRank | null,
  ptsToNext: number
): string {
  if (!nextRank) return "最高ランク達成！知能経済のパイオニアです。";
  if (input.ownedCount === 0) return "まず1つ知能を購入してランクアップへ。";
  if (input.listingCount === 0)
    return "初めての出品をすると手数料3%OFF＋次のランクに近づく。";
  if (ptsToNext <= 10)
    return `あと一歩！${nextRank} まであと ${ptsToNext} pt。`;
  if (input.salesCount === 0)
    return "Remix出品で初販売を目指そう。達成で大きくランクアップ。";
  return `あと ${ptsToNext} pt で ${nextRank} に昇格。出品数を増やそう。`;
}
