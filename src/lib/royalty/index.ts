// GUILD AI — Royalty Distribution (価値の継承)
// distributeRoyalty() spreads a portion of every secondary sale back to ancestor creators,
// with exponential decay per generation.
// Spec: docs/マスター設計図.md §7 (ロイヤリティ還元).

import type { Creator, RoyaltyDistribution, RoyaltyResult } from "@/types";

// Generation tiers: index 0 = direct parent (gen 1), index 1 = grandparent (gen 2), etc.
const TIERS: ReadonlyArray<{ pct: number; trustBonus: number }> = [
  { pct: 0.15, trustBonus: 10 }, // gen 1 — direct parent
  { pct: 0.07, trustBonus: 5 },  // gen 2 — grandparent
  { pct: 0.03, trustBonus: 2 },  // gen 3 — great-grandparent
];

/**
 * distributeRoyalty — given a sale amount and an ordered lineage (oldest → newest),
 * computes how much each ancestor receives and what Trust Score bonus they gain.
 *
 * Total royalty is capped at 25% (15 + 7 + 3) across at most 3 generations.
 * The seller receives `sellerNet = saleAmount − totalRoyaltyPaid`.
 */
export function distributeRoyalty(saleAmount: number, lineage: Creator[]): RoyaltyResult {
  // Reverse so index 0 is the direct parent (newest creator).
  const reversed = [...lineage].reverse();
  const distributions: RoyaltyDistribution[] = [];
  let totalRoyaltyPaid = 0;

  for (let i = 0; i < Math.min(reversed.length, TIERS.length); i++) {
    const tier = TIERS[i];
    const creator = reversed[i];
    const amount = Math.round(saleAmount * tier.pct);
    totalRoyaltyPaid += amount;
    distributions.push({
      creatorId: creator.creatorId,
      name: creator.name,
      amount,
      trustScoreBonus: tier.trustBonus,
      generation: i + 1,
    });
  }

  return {
    distributions,
    totalRoyaltyPaid,
    sellerNet: saleAmount - totalRoyaltyPaid,
  };
}
