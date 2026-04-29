import { describe, it, expect } from "vitest";
import {
  generateBeforeAfterSpec,
  renderBeforeAfterSvg,
} from "@/lib/before-after";
import type { Rank } from "@/types";

const ALL_TEMPLATES = ["DataClean", "Automate", "UIPolish", "Speed", "Insight"] as const;

describe("generateBeforeAfterSpec", () => {
  const ranks: Rank[] = ["S", "A", "B"];

  for (const rank of ranks) {
    it(`returns valid spec for rank ${rank}`, () => {
      const spec = generateBeforeAfterSpec("asset-001", rank);
      expect(spec.rank).toBe(rank);
      expect(ALL_TEMPLATES).toContain(spec.template);
      expect(spec.beforeLabel.length).toBeGreaterThan(0);
      expect(spec.afterLabel.length).toBeGreaterThan(0);
      expect(spec.primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(spec.secondaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  }

  it("is deterministic — same assetId + rank returns same template", () => {
    const spec1 = generateBeforeAfterSpec("asset-test-123", "S");
    const spec2 = generateBeforeAfterSpec("asset-test-123", "S");
    expect(spec1.template).toBe(spec2.template);
    expect(spec1.beforeLabel).toBe(spec2.beforeLabel);
    expect(spec1.afterLabel).toBe(spec2.afterLabel);
  });

  it("all 5 templates are reachable across different assetIds", () => {
    const foundTemplates = new Set<string>();
    const testIds = [
      "asset-001", "asset-002", "asset-003", "asset-004", "asset-005",
      "asset-006", "asset-007", "asset-008", "asset-009", "asset-010",
      "asset-abc", "asset-xyz", "asset-foo", "asset-bar", "asset-baz",
      "asset-qux", "asset-quux", "asset-corge", "asset-grault", "asset-garply",
    ];
    for (const id of testIds) {
      const spec = generateBeforeAfterSpec(id, "S");
      foundTemplates.add(spec.template);
    }
    for (const t of ALL_TEMPLATES) {
      expect(foundTemplates, `Template "${t}" should be reachable`).toContain(t);
    }
  });
});

describe("renderBeforeAfterSvg", () => {
  it('returns string containing "Before"', () => {
    const spec = generateBeforeAfterSpec("asset-001", "S");
    const svg = renderBeforeAfterSvg(spec);
    expect(svg).toContain("Before");
  });

  it('returns string containing "After"', () => {
    const spec = generateBeforeAfterSpec("asset-001", "S");
    const svg = renderBeforeAfterSvg(spec);
    expect(svg).toContain("After");
  });

  it("returns valid SVG string", () => {
    const spec = generateBeforeAfterSpec("asset-001", "A");
    const svg = renderBeforeAfterSvg(spec);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it("includes beforeLabel and afterLabel in output", () => {
    const spec = generateBeforeAfterSpec("asset-002", "B");
    const svg = renderBeforeAfterSvg(spec);
    expect(svg).toContain(spec.beforeLabel);
    expect(svg).toContain(spec.afterLabel);
  });
});
