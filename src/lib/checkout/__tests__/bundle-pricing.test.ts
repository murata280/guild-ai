import { describe, it, expect } from "vitest";
import { computeBundlePricing, computeMonthlyFromFloor } from "../index";

describe("computeBundlePricing", () => {
  it("oneoff equals monthly × 12, perCall >= 0.1", () => {
    const result = computeBundlePricing(10000);
    expect(result.oneoffJpy).toBe(120000);
    expect(result.perCallJpyc).toBeGreaterThanOrEqual(0.1);
    expect(result.monthlyJpy).toBe(10000);
  });

  it("perCall never below 0.1 for very low floor prices", () => {
    const low = computeBundlePricing(100);
    expect(low.perCallJpyc).toBe(0.1);

    const veryLow = computeBundlePricing(0);
    expect(veryLow.perCallJpyc).toBe(0.1);
  });
});

describe("computeMonthlyFromFloor", () => {
  it("derives monthly from floor price as floor/12 rounded", () => {
    expect(computeMonthlyFromFloor(60000)).toBe(5000);
    expect(computeMonthlyFromFloor(8000)).toBe(667);
  });
});
