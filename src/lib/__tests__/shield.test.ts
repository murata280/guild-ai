import { describe, it, expect } from "vitest";
import { obfuscateCcafForPublic, isFullCcafAccessible } from "@/lib/shield";

describe("shield", () => {
  describe("obfuscateCcafForPublic", () => {
    it("returns high density for thoughtDensity >= 70", () => {
      const result = obfuscateCcafForPublic({ thoughtDensity: 70, iterations: 10, intentSignals: ["#ai"] });
      expect(result.thoughtDensity).toBe("high");
    });

    it("returns high density for thoughtDensity = 80", () => {
      const result = obfuscateCcafForPublic({ thoughtDensity: 80, iterations: 12, intentSignals: ["#ai", "#nlp"] });
      expect(result.thoughtDensity).toBe("high");
    });

    it("returns medium density for thoughtDensity 40-69", () => {
      const result = obfuscateCcafForPublic({ thoughtDensity: 55, iterations: 5, intentSignals: [] });
      expect(result.thoughtDensity).toBe("medium");
      const result40 = obfuscateCcafForPublic({ thoughtDensity: 40, iterations: 5, intentSignals: [] });
      expect(result40.thoughtDensity).toBe("medium");
    });

    it("returns low density for thoughtDensity < 40", () => {
      const result = obfuscateCcafForPublic({ thoughtDensity: 39, iterations: 3, intentSignals: [] });
      expect(result.thoughtDensity).toBe("low");
      const result0 = obfuscateCcafForPublic({ thoughtDensity: 0, iterations: 1, intentSignals: [] });
      expect(result0.thoughtDensity).toBe("low");
    });

    it("note field mentions フルスペック", () => {
      const result = obfuscateCcafForPublic({ thoughtDensity: 80, iterations: 12, intentSignals: ["#ai", "#nlp"] });
      expect(result.note).toContain("フルスペック");
    });

    it("returns correct iterationsRange", () => {
      expect(obfuscateCcafForPublic({ thoughtDensity: 50, iterations: 15, intentSignals: [] }).iterationsRange).toBe("15+");
      expect(obfuscateCcafForPublic({ thoughtDensity: 50, iterations: 8, intentSignals: [] }).iterationsRange).toBe("8-14");
      expect(obfuscateCcafForPublic({ thoughtDensity: 50, iterations: 3, intentSignals: [] }).iterationsRange).toBe("1-7");
    });

    it("intentSignalCount matches array length", () => {
      const result = obfuscateCcafForPublic({ thoughtDensity: 80, iterations: 12, intentSignals: ["#ai", "#nlp"] });
      expect(result.intentSignalCount).toBe(2);
    });
  });

  describe("isFullCcafAccessible", () => {
    it("returns true for gld_ bearer token", () => {
      expect(isFullCcafAccessible("gld_abc123")).toBe(true);
      expect(isFullCcafAccessible("gld_")).toBe(true);
    });

    it("returns false for null", () => {
      expect(isFullCcafAccessible(null)).toBe(false);
    });

    it("returns false for non-gld_ bearer", () => {
      expect(isFullCcafAccessible("Bearer xyz")).toBe(false);
      expect(isFullCcafAccessible("sk_live_abc")).toBe(false);
    });
  });
});
