// GUILD AI — Asset Health
// Deterministic health metrics seeded from assetId.
// No randomness — same assetId always returns the same values.

export interface AssetHealth {
  uptimePercent: number;  // 95.0–99.9
  successRate: number;    // 96.0–99.4
  aiVerified: boolean;
}

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getAssetHealth(assetId: string): AssetHealth {
  const h1 = djb2(assetId);
  const h2 = djb2(assetId + "_sr");

  // h1 % 50 → 0-49, /10 → 0.0-4.9, +95 → 95.0-99.9
  const uptimePercent = Math.round((95 + (h1 % 50) / 10) * 10) / 10;
  // h2 % 35 → 0-34, /10 → 0.0-3.4, +96 → 96.0-99.4
  const successRate = Math.round((96 + (h2 % 35) / 10) * 10) / 10;

  return { uptimePercent, successRate, aiVerified: true };
}
