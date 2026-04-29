import { describe, it, expect } from "vitest";
import { computeTrustScore, computeFloorPrice } from "../index";

describe("computeTrustScore", () => {
  it("uses the documented weights (0.5/0.3/0.2)", () => {
    const r = computeTrustScore({
      qualityHistory: 100,
      discordContribution: 0,
      xAmplification: 0
    });
    // raw = 50 → score = 500
    expect(r.raw).toBe(50);
    expect(r.score).toBe(500);
  });

  it("normalizes to a 0-1000 score", () => {
    const r = computeTrustScore({
      qualityHistory: 100,
      discordContribution: 100,
      xAmplification: 100
    });
    expect(r.score).toBe(1000);
  });

  it("returns rank S when raw >= 80", () => {
    const r = computeTrustScore({
      qualityHistory: 90,
      discordContribution: 80,
      xAmplification: 60
    });
    // raw = 45 + 24 + 12 = 81
    expect(r.raw).toBeGreaterThanOrEqual(80);
    expect(r.rank).toBe("S");
  });

  it("returns rank A when 60 <= raw < 80", () => {
    const r = computeTrustScore({
      qualityHistory: 70,
      discordContribution: 60,
      xAmplification: 50
    });
    // raw = 35 + 18 + 10 = 63
    expect(r.rank).toBe("A");
  });

  it("returns rank B when raw < 60", () => {
    const r = computeTrustScore({
      qualityHistory: 30,
      discordContribution: 30,
      xAmplification: 30
    });
    expect(r.rank).toBe("B");
  });

  it("clamps inputs out of range", () => {
    const r = computeTrustScore({
      qualityHistory: 200,
      discordContribution: -50,
      xAmplification: 9999
    });
    // q=100, d=0, x=100 → raw = 50 + 0 + 20 = 70
    expect(r.raw).toBe(70);
    expect(r.score).toBe(700);
  });
});

describe("computeFloorPrice (rank overload)", () => {
  it("S rank applies 1.5× multiplier on base price", () => {
    const floor = computeFloorPrice("S", 0, 1000);
    expect(floor).toBe(1500);
  });

  it("A rank applies 1.2× multiplier", () => {
    const floor = computeFloorPrice("A", 0, 1000);
    expect(floor).toBe(1200);
  });

  it("B rank applies 1.0× multiplier", () => {
    const floor = computeFloorPrice("B", 0, 1000);
    expect(floor).toBe(1000);
  });

  it("rating bonus caps at 20 ratings (+20%)", () => {
    const at0  = computeFloorPrice("B", 0,  1000);
    const at20 = computeFloorPrice("B", 20, 1000);
    const at50 = computeFloorPrice("B", 50, 1000);
    expect(at20).toBeGreaterThan(at0);
    expect(at50).toBe(at20); // capped at 20
  });
});

describe("computeFloorPrice (legacy trust-score overload)", () => {
  it("returns at least 80% of suggested price when trust is 0", () => {
    const floor = computeFloorPrice(5000, 0);
    expect(floor).toBe(Math.round(5000 * 0.8));
  });

  it("returns more than base when trust is high", () => {
    const low  = computeFloorPrice(5000, 0);
    const high = computeFloorPrice(5000, 800);
    expect(high).toBeGreaterThan(low);
  });
});
