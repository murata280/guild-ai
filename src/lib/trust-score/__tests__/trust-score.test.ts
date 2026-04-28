import { describe, it, expect } from "vitest";
import { computeTrustScore } from "../index";

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
