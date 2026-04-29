import { describe, it, expect } from "vitest";
import { generateSpirit, renderSpiritSvg, faceOverlaySvgString } from "../index";

describe("generateSpirit", () => {
  it("is deterministic", () => {
    const a = generateSpirit("asset-x1", "S");
    const b = generateSpirit("asset-x1", "S");
    expect(a).toEqual(b);
  });

  it("stores the assetId and rank", () => {
    const spec = generateSpirit("my-asset", "A");
    expect(spec.assetId).toBe("my-asset");
    expect(spec.rank).toBe("A");
  });
});

describe("faceOverlaySvgString", () => {
  it("S rank contains sparkle (star eye ellipses) and blush", () => {
    const svg = faceOverlaySvgString("S", 100);
    expect(svg).toContain("ellipse");
    expect(svg).toContain("FFB6C1"); // blush color
    expect(svg).toContain("F5A623"); // sparkle gold
  });

  it("A rank contains circle eyes and arc smile", () => {
    const svg = faceOverlaySvgString("A", 100);
    expect(svg).toContain("<circle");
    expect(svg).toContain("<path"); // arc smile
    expect(svg).toContain("FFB6C1"); // blush
  });

  it("B rank contains もぐもぐ O mouth", () => {
    const svg = faceOverlaySvgString("B", 100);
    expect(svg).toContain("<ellipse");
    // B rank has no blush
    expect(svg).not.toContain("FFB6C1");
  });

  it("all ranks include the ghost face oval", () => {
    for (const rank of ["S", "A", "B"] as const) {
      expect(faceOverlaySvgString(rank, 100)).toContain("white");
    }
  });
});

describe("renderSpiritSvg", () => {
  it("returns valid SVG", () => {
    const svg = renderSpiritSvg("spirit-test", "A");
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain("</svg>");
  });

  it("includes face overlay on top of emblem gradients", () => {
    const svg = renderSpiritSvg("overlay-test", "S");
    expect(svg).toContain("<linearGradient"); // from emblem
    expect(svg).toContain("FFB6C1");          // blush from spirit
  });

  it("size parameter propagates to viewBox", () => {
    const svg = renderSpiritSvg("size-test", "B", 200);
    expect(svg).toContain('viewBox="0 0 200 200"');
  });

  it("does not have nested <svg> tags", () => {
    const svg = renderSpiritSvg("nesting-test", "A");
    const count = (svg.match(/<svg/g) ?? []).length;
    expect(count).toBe(1);
  });
});
