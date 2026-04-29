import type { Rank } from "@/types";

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function assignMorphTag(assetId: string, rank: Rank): string {
  const seed = djb2(assetId);
  const suffix = (seed % 9999).toString(16).padStart(4, "0");
  return `morph-${rank.toLowerCase()}-${suffix}`;
}

export function startViewTransition(callback: () => void): void {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(callback);
  } else {
    callback();
  }
}
