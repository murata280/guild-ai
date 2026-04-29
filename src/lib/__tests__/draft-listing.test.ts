import { describe, it, expect } from "vitest";
import { generateDraftCCAF, generateAllDraftListings } from "@/lib/draft-listing";
import { crawlPublicSources } from "@/lib/crawler";

describe("draft-listing", () => {
  const repos = crawlPublicSources();
  const first = repos[0];

  describe("generateDraftCCAF", () => {
    it("returns object with provisional: true", () => {
      const draft = generateDraftCCAF(first);
      expect(draft.provisional).toBe(true);
    });

    it("has claimStatus field", () => {
      const draft = generateDraftCCAF(first);
      expect(["unclaimed", "verifying", "claimed"]).toContain(draft.claimStatus);
    });

    it("has valuePool as a number", () => {
      const draft = generateDraftCCAF(first);
      expect(typeof draft.valuePool).toBe("number");
      expect(draft.valuePool).toBeGreaterThanOrEqual(0);
    });

    it("has useCases array with 3 items", () => {
      const draft = generateDraftCCAF(first);
      expect(Array.isArray(draft.useCases)).toBe(true);
      expect(draft.useCases).toHaveLength(3);
    });

    it("rank is one of S/A/B", () => {
      const draft = generateDraftCCAF(first);
      expect(["S", "A", "B"]).toContain(draft.rank);
    });

    it("is deterministic for same input", () => {
      const d1 = generateDraftCCAF(first);
      const d2 = generateDraftCCAF(first);
      expect(d1.id).toBe(d2.id);
      expect(d1.rank).toBe(d2.rank);
      expect(d1.floorPrice).toBe(d2.floorPrice);
    });

    it("has ccaf with thoughtDensity, iterations, intentSignals", () => {
      const draft = generateDraftCCAF(first);
      expect(typeof draft.ccaf.thoughtDensity).toBe("number");
      expect(typeof draft.ccaf.iterations).toBe("number");
      expect(Array.isArray(draft.ccaf.intentSignals)).toBe(true);
    });
  });

  describe("generateAllDraftListings", () => {
    it("returns 10 listings (one per crawled repo)", () => {
      const listings = generateAllDraftListings();
      expect(listings).toHaveLength(10);
    });

    it("all listings have provisional: true", () => {
      const listings = generateAllDraftListings();
      for (const listing of listings) {
        expect(listing.provisional).toBe(true);
      }
    });
  });
});
