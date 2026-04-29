import { describe, it, expect } from "vitest";
import { getLicenseQuote } from "@/lib/api-licensing";

const mockAsset = { floorPrice: 12000 };

describe("api-licensing", () => {
  describe("getLicenseQuote", () => {
    it("applies 1.3x multiplier for big-ai caller", () => {
      const base = getLicenseQuote("agent", mockAsset);
      const bigAi = getLicenseQuote("big-ai", mockAsset);
      // big-ai should be 1.3x of base, rounded to 1 decimal
      const expected = Math.round(base.perCallJpyc * 1.3 * 10) / 10;
      expect(bigAi.perCallJpyc).toBe(expected);
      expect(bigAi.perCallJpyc).toBeGreaterThan(base.perCallJpyc);
    });

    it("agent caller uses base rate, premiumApplied=false", () => {
      const quote = getLicenseQuote("agent", mockAsset);
      expect(quote.premiumApplied).toBe(false);
      expect(quote.note).toBeUndefined();
    });

    it("human caller uses base rate, premiumApplied=false", () => {
      const quote = getLicenseQuote("human", mockAsset);
      expect(quote.premiumApplied).toBe(false);
      expect(quote.note).toBeUndefined();
    });

    it("big-ai caller has premiumApplied=true and note", () => {
      const quote = getLicenseQuote("big-ai", mockAsset);
      expect(quote.premiumApplied).toBe(true);
      expect(quote.note).toBeDefined();
      expect(quote.note).toContain("1.3");
    });

    it("callerType is reflected in quote", () => {
      expect(getLicenseQuote("agent", mockAsset).callerType).toBe("agent");
      expect(getLicenseQuote("big-ai", mockAsset).callerType).toBe("big-ai");
      expect(getLicenseQuote("human", mockAsset).callerType).toBe("human");
    });

    it("agent and human produce same perCallJpyc", () => {
      const agent = getLicenseQuote("agent", mockAsset);
      const human = getLicenseQuote("human", mockAsset);
      expect(agent.perCallJpyc).toBe(human.perCallJpyc);
    });
  });
});
