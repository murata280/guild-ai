import { describe, it, expect } from "vitest";
import { getAssetHealth } from "../index";

describe("getAssetHealth", () => {
  it("is deterministic — same assetId returns same values", () => {
    const a = getAssetHealth("asset-001");
    const b = getAssetHealth("asset-001");
    expect(a.uptimePercent).toBe(b.uptimePercent);
    expect(a.successRate).toBe(b.successRate);
    expect(a.aiVerified).toBe(b.aiVerified);
  });

  it("uptimePercent is in range 95.0–99.9", () => {
    for (const id of ["asset-001", "asset-002", "asset-003", "asset-abc", "xyz-999"]) {
      const { uptimePercent } = getAssetHealth(id);
      expect(uptimePercent).toBeGreaterThanOrEqual(95);
      expect(uptimePercent).toBeLessThanOrEqual(99.9);
    }
  });

  it("successRate is in range 96.0–99.4", () => {
    for (const id of ["asset-001", "asset-002", "asset-003", "asset-abc", "xyz-999"]) {
      const { successRate } = getAssetHealth(id);
      expect(successRate).toBeGreaterThanOrEqual(96);
      expect(successRate).toBeLessThanOrEqual(99.5);
    }
  });

  it("different assetIds produce different results", () => {
    const a = getAssetHealth("asset-001");
    const b = getAssetHealth("asset-002");
    // It's extremely unlikely both are identical
    const same = a.uptimePercent === b.uptimePercent && a.successRate === b.successRate;
    expect(same).toBe(false);
  });
});
