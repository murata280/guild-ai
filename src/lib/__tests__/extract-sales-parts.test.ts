import { describe, it, expect } from "vitest";
import { extractSalesParts } from "@/lib/listing-generator";

describe("extractSalesParts", () => {
  it("detects TypeScript selling point", () => {
    const { sellingPoints } = extractSalesParts("# My App\nBuilt with TypeScript and React.");
    expect(sellingPoints.some((p) => p.includes("型安全"))).toBe(true);
  });

  it("detects AI selling point for OpenAI mention", () => {
    const { sellingPoints } = extractSalesParts("# Bot\nUses OpenAI GPT-4 for summarization.");
    expect(sellingPoints.some((p) => p.includes("AI"))).toBe(true);
  });

  it("returns at least one selling point even for plain readme", () => {
    const { sellingPoints } = extractSalesParts("# My Project\nA simple tool.");
    expect(sellingPoints.length).toBeGreaterThanOrEqual(1);
  });

  it("returns a non-empty productManual array", () => {
    const { productManual } = extractSalesParts("# x");
    expect(productManual.length).toBeGreaterThan(0);
  });

  it("priceSuggestion increases with more detected tech", () => {
    const minimal = extractSalesParts("# simple");
    const rich    = extractSalesParts("# App\nTypeScript + React + OpenAI + Docker + CI/CD + Vercel");
    expect(rich.priceSuggestion).toBeGreaterThan(minimal.priceSuggestion);
  });
});
