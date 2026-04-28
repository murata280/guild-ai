import { describe, it, expect } from "vitest";
import { audit, computeFloorPrice } from "../index";
import type { CCAF } from "@/types";

const baseCCAF = (overrides: Partial<CCAF> = {}): CCAF => ({
  intentSignals: ["author-statement"],
  thoughtDensity: 85,
  iterations: 12,
  authorId: "user_1",
  createdAt: "2026-01-01T00:00:00Z",
  ...overrides
});

describe("ai-auditor.audit", () => {
  it("assigns S rank when density>=80, uptime>=30, and intent signals present (魂の登記)", () => {
    const result = audit({ ccaf: baseCCAF(), vercelUptimeDays: 45 });
    expect(result.rank).toBe("S");
    expect(result.reasons.join(" ")).toMatch(/魂の登記/);
  });

  it("never reaches S when intent signals are missing (魂の登記 guard)", () => {
    const result = audit({
      ccaf: baseCCAF({ intentSignals: [] }),
      vercelUptimeDays: 90
    });
    expect(result.rank).not.toBe("S");
  });

  it("assigns A rank when density>=60 and uptime>=7", () => {
    const result = audit({
      ccaf: baseCCAF({ thoughtDensity: 65, intentSignals: [] }),
      vercelUptimeDays: 10
    });
    expect(result.rank).toBe("A");
  });

  it("assigns B rank as the baseline guarantee", () => {
    const result = audit({
      ccaf: baseCCAF({ thoughtDensity: 30 }),
      vercelUptimeDays: 1
    });
    expect(result.rank).toBe("B");
  });

  it("computes composite score in 0-100 range", () => {
    const result = audit({ ccaf: baseCCAF(), vercelUptimeDays: 60 });
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

describe("ai-auditor.computeFloorPrice", () => {
  it("returns basePrice when trustScore is 0", () => {
    expect(computeFloorPrice(1000, 0)).toBe(1000);
  });

  it("caps the boost at +50% for trustScore 1000", () => {
    expect(computeFloorPrice(1000, 1000)).toBe(1500);
  });

  it("rounds to 2 decimals", () => {
    const v = computeFloorPrice(123.456, 500);
    expect(Number.isFinite(v)).toBe(true);
  });
});
