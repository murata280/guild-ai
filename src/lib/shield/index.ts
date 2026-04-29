export interface ObfuscatedCCAF {
  thoughtDensity: "low" | "medium" | "high";
  iterationsRange: string;
  intentSignalCount: number;
  note: string;
}

export function obfuscateCcafForPublic(ccaf: {
  thoughtDensity: number;
  iterations: number;
  intentSignals: string[];
}): ObfuscatedCCAF {
  const density = ccaf.thoughtDensity >= 70 ? "high" : ccaf.thoughtDensity >= 40 ? "medium" : "low";
  const iters = ccaf.iterations;
  const iterRange = iters >= 15 ? "15+" : iters >= 8 ? "8-14" : "1-7";
  return {
    thoughtDensity: density,
    iterationsRange: iterRange,
    intentSignalCount: ccaf.intentSignals.length,
    note: "フルスペックは決済後に閲覧できます",
  };
}

export function isFullCcafAccessible(bearer: string | null): boolean {
  // Mock: any non-null bearer token starting with gld_ grants access
  return bearer !== null && bearer.startsWith("gld_");
}
