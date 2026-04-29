export type VerificationLevel = "ai-generated" | "human-claimed" | "human-verified-gold";

export function getVerificationLevel(asset: {
  provisional?: boolean;
  claimStatus?: string;
  trustScore?: number;
}): VerificationLevel {
  if (asset.provisional) return "ai-generated";
  if (asset.claimStatus === "claimed" && (asset.trustScore ?? 0) >= 600) return "human-verified-gold";
  if (asset.claimStatus === "claimed") return "human-claimed";
  return "ai-generated";
}

export function applyHumanPremium(basePrice: number, level: VerificationLevel): number {
  const multiplier =
    level === "human-verified-gold" ? 1.5 :
    level === "human-claimed" ? 1.2 :
    0.7;
  return Math.round(basePrice * multiplier);
}
