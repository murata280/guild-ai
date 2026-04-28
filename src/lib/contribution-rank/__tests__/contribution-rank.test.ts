import { describe, it, expect } from "vitest";
import { computeContributionRank, computeScore } from "../index";

describe("computeScore", () => {
  it("returns 0 for empty input", () => {
    expect(computeScore({ ownedCount: 0, salesCount: 0, listingCount: 0, apiCalls: 0 })).toBe(0);
  });

  it("weights each field correctly", () => {
    // 1 owned=5, 1 sale=10, 1 listing=15, 1 apiCall=1 → 31
    expect(computeScore({ ownedCount: 1, salesCount: 1, listingCount: 1, apiCalls: 1 })).toBe(31);
  });
});

describe("computeContributionRank", () => {
  it("returns Newcomer for zero activity", () => {
    const result = computeContributionRank({ ownedCount: 0, salesCount: 0, listingCount: 0, apiCalls: 0 });
    expect(result.rank).toBe("Newcomer");
    expect(result.score).toBe(0);
    expect(result.nextRank).toBe("Riser");
  });

  it("returns Riser for 2 owned assets (score=10)", () => {
    const result = computeContributionRank({ ownedCount: 2, salesCount: 0, listingCount: 0, apiCalls: 0 });
    expect(result.rank).toBe("Riser");
    expect(result.nextRank).toBe("Creator");
  });

  it("returns Creator for 2 owned + 2 listings (score=40)", () => {
    const result = computeContributionRank({ ownedCount: 2, salesCount: 0, listingCount: 2, apiCalls: 0 });
    expect(result.rank).toBe("Creator");
    expect(result.score).toBe(40);
    expect(result.nextRank).toBe("Pro Creator");
  });

  it("returns Legendary for high activity", () => {
    const result = computeContributionRank({ ownedCount: 5, salesCount: 3, listingCount: 4, apiCalls: 5 });
    // score = 25+30+60+5 = 120
    expect(result.rank).toBe("Legendary");
    expect(result.nextRank).toBeNull();
    expect(result.progress).toBe(100);
  });

  it("progress approaches 100 as score approaches next threshold", () => {
    // Newcomer threshold=0, Riser threshold=10. At score=9, progress should be close to 90
    const result = computeContributionRank({ ownedCount: 1, salesCount: 0, listingCount: 0, apiCalls: 4 });
    // score = 5+4 = 9, progress = (9-0)/(10-0)*100 = 90
    expect(result.rank).toBe("Newcomer");
    expect(result.progress).toBe(90);
  });
});
