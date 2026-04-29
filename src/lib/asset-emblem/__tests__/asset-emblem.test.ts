import { describe, it, expect } from "vitest";
import {
  generateEmblemSpec,
  renderEmblemSvg,
  specToVectorEmbedding,
} from "../index";

describe("generateEmblemSpec", () => {
  it("is deterministic — same assetId always yields same spec", () => {
    const a = generateEmblemSpec("asset-001");
    const b = generateEmblemSpec("asset-001");
    expect(a).toEqual(b);
  });

  it("axes is either 5 or 7", () => {
    for (const id of ["a1", "b2", "c3", "d4", "e5", "f6"]) {
      const { axes } = generateEmblemSpec(id);
      expect([5, 7]).toContain(axes);
    }
  });

  it("petalRadius is in range 28–37", () => {
    for (const id of ["x1", "x2", "x3", "x4", "x5"]) {
      const { petalRadius } = generateEmblemSpec(id);
      expect(petalRadius).toBeGreaterThanOrEqual(28);
      expect(petalRadius).toBeLessThanOrEqual(37);
    }
  });

  it("centerRadius is in range 10–17", () => {
    for (const id of ["y1", "y2", "y3"]) {
      const { centerRadius } = generateEmblemSpec(id);
      expect(centerRadius).toBeGreaterThanOrEqual(10);
      expect(centerRadius).toBeLessThanOrEqual(17);
    }
  });

  it("all three colors are distinct hex strings", () => {
    const { primaryColor, secondaryColor, accentColor } = generateEmblemSpec("uniqueness-test");
    expect(primaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(secondaryColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(accentColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    // All three should differ
    const colors = new Set([primaryColor, secondaryColor, accentColor]);
    expect(colors.size).toBe(3);
  });

  it("different assetIds produce different specs", () => {
    const a = generateEmblemSpec("asset-aaa");
    const b = generateEmblemSpec("asset-bbb");
    expect(a.primaryColor).not.toBe(b.primaryColor);
  });
});

describe("renderEmblemSvg", () => {
  it("returns valid SVG with xmlns", () => {
    const spec = generateEmblemSpec("svg-test");
    const svg = renderEmblemSvg(spec);
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it("contains correct number of ellipses matching axes", () => {
    const spec5 = generateEmblemSpec("axes5-test");
    const spec7 = generateEmblemSpec("axes7-test");
    // Find an assetId that gives 5 and one that gives 7
    const specs = [spec5, spec7].filter((s) => s.axes === 5 || s.axes === 7);
    for (const s of specs) {
      const svg = renderEmblemSvg(s);
      const count = (svg.match(/<ellipse/g) ?? []).length;
      expect(count).toBe(s.axes);
    }
  });

  it("includes linearGradient and radialGradient defs", () => {
    const spec = generateEmblemSpec("gradient-test");
    const svg = renderEmblemSvg(spec);
    expect(svg).toContain("<linearGradient");
    expect(svg).toContain("<radialGradient");
  });

  it("size parameter scales viewBox and dimensions", () => {
    const spec = generateEmblemSpec("size-test");
    const svg200 = renderEmblemSvg(spec, 200);
    expect(svg200).toContain('viewBox="0 0 200 200"');
    expect(svg200).toContain('width="200"');
    expect(svg200).toContain('height="200"');
  });

  it("includes outer ring only when spec.hasOuterRing is true", () => {
    // Brute-force find one spec with and without ring
    let withRing = null as ReturnType<typeof generateEmblemSpec> | null;
    let withoutRing = null as ReturnType<typeof generateEmblemSpec> | null;
    for (let i = 0; i < 50; i++) {
      const s = generateEmblemSpec(`ring-scan-${i}`);
      if (s.hasOuterRing && !withRing) withRing = s;
      if (!s.hasOuterRing && !withoutRing) withoutRing = s;
      if (withRing && withoutRing) break;
    }
    if (withRing) {
      expect(renderEmblemSvg(withRing)).toContain('stroke="');
    }
    if (withoutRing) {
      const svgNoRing = renderEmblemSvg(withoutRing);
      // No outer ring = no stroke on the ring circle (center circles have fill, not stroke)
      const lines = svgNoRing.split("\n").filter((l) => l.includes("stroke="));
      expect(lines.length).toBe(0);
    }
  });
});

describe("specToVectorEmbedding", () => {
  it("returns a 14-element array (5 scalars + 3×3 RGB channels)", () => {
    const spec = generateEmblemSpec("vec-test");
    expect(specToVectorEmbedding(spec)).toHaveLength(14);
  });

  it("all values are between 0 and 1", () => {
    const spec = generateEmblemSpec("range-test");
    const vec = specToVectorEmbedding(spec);
    vec.forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    });
  });

  it("is deterministic", () => {
    const spec = generateEmblemSpec("det-test");
    expect(specToVectorEmbedding(spec)).toEqual(specToVectorEmbedding(spec));
  });
});
