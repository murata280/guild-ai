import { computeBundlePricing, computeMonthlyFromFloor } from "@/lib/checkout";

export type CallerType = "agent" | "big-ai" | "human";

export interface LicenseQuote {
  callerType: CallerType;
  perCallJpyc: number;
  premiumApplied: boolean;
  note?: string;
}

export function getLicenseQuote(callerType: CallerType, asset: { floorPrice: number }): LicenseQuote {
  const monthly = computeMonthlyFromFloor(asset.floorPrice);
  const base = computeBundlePricing(monthly);
  const isBigAi = callerType === "big-ai";
  const perCallJpyc = isBigAi
    ? Math.round(base.perCallJpyc * 1.3 * 10) / 10
    : base.perCallJpyc;
  return {
    callerType,
    perCallJpyc,
    premiumApplied: isBigAi,
    note: isBigAi ? "大規模AIプレミア（×1.3）適用" : undefined,
  };
}

export function recordMicropayment(assetId: string, callerType: CallerType, amountJpyc: number): void {
  // In-memory mock — notifications would be pushed in a real system
  // Using void to suppress unused variable warning in non-debug builds
  void `[micropayment] asset:${assetId} caller:${callerType} amount:${amountJpyc}JPYC`;
}
