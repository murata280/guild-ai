import { describe, it, expect } from "vitest";
import { extractTags, deriveTitle } from "../index";

describe("weapons.extractTags", () => {
  it("extracts hashtags from note content", () => {
    const tags = extractTags("My note #AI #設計 some content");
    expect(tags).toContain("AI");
    expect(tags).toContain("設計");
  });

  it("auto-detects AI keyword without hashtag", () => {
    const tags = extractTags("This is about LLM integration techniques");
    expect(tags).toContain("AI");
  });

  it("auto-detects テスト keyword", () => {
    const tags = extractTags("テスト自動化とCI/CDの話");
    expect(tags).toContain("テスト");
  });

  it("caps tags at 5", () => {
    const tags = extractTags("#a #b #c #d #e #f this is about AI and テスト and マーケティング");
    expect(tags.length).toBeLessThanOrEqual(5);
  });

  it("deduplicates tags", () => {
    const tags = extractTags("#AI this is about AI and LLM");
    const aiCount = tags.filter((t) => t === "AI").length;
    expect(aiCount).toBe(1);
  });
});

describe("weapons.deriveTitle", () => {
  it("uses first line as title when short enough", () => {
    const title = deriveTitle("# My Great Design\n\nSome content here");
    expect(title).toBe("My Great Design");
  });

  it("strips leading # markers", () => {
    const title = deriveTitle("## Architecture Notes\nContent");
    expect(title).toBe("Architecture Notes");
  });

  it("truncates long first lines", () => {
    const longNote = "A".repeat(60) + "\nContent";
    const title = deriveTitle(longNote);
    expect(title.length).toBeLessThanOrEqual(33);
    expect(title).toContain("…");
  });

  it("falls back to content slice for no-header notes", () => {
    const title = deriveTitle("Short");
    expect(title.length).toBeGreaterThan(0);
  });
});
