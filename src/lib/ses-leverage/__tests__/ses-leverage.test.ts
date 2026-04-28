import { describe, it, expect } from "vitest";
import { computeLeverage } from "../index";

describe("computeLeverage", () => {
  it("returns multiplier 1 when no royalties", () => {
    const result = computeLeverage(500000, []);
    expect(result.multiplier).toBe(1);
    expect(result.breakdown.royaltyIncome).toBe(0);
    expect(result.totalIncome).toBe(500000);
  });

  it("computes multiplier correctly with royalties", () => {
    const result = computeLeverage(500000, [100000, 50000]);
    expect(result.breakdown.royaltyIncome).toBe(150000);
    expect(result.totalIncome).toBe(650000);
    expect(result.multiplier).toBe(1.3);
  });

  it("projectedTrend is 1.2× royalty income", () => {
    const result = computeLeverage(400000, [200000]);
    expect(result.breakdown.projectedTrend).toBe(240000);
  });
});
