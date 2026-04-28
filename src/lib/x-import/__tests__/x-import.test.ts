import { describe, it, expect } from "vitest";
import { extractFromPostUrl } from "../index";

describe("extractFromPostUrl", () => {
  it("returns 未検出 for invalid URL", () => {
    const result = extractFromPostUrl("https://example.com/foo");
    expect(result.suggestedTitle).toBe("未検出");
    expect(result.hashtags).toHaveLength(0);
  });

  it("returns structured data for valid x.com post URL", () => {
    const result = extractFromPostUrl("https://x.com/user/status/1234567890");
    expect(result.suggestedTitle).not.toBe("未検出");
    expect(result.hashtags.length).toBeGreaterThan(0);
    expect(result.suggestedDescription.length).toBeGreaterThan(10);
  });

  it("is deterministic — same URL returns same result", () => {
    const url = "https://twitter.com/testuser/status/9876543210";
    const a = extractFromPostUrl(url);
    const b = extractFromPostUrl(url);
    expect(a.suggestedTitle).toBe(b.suggestedTitle);
    expect(a.hashtags).toEqual(b.hashtags);
  });

  it("accepts twitter.com URLs", () => {
    const result = extractFromPostUrl("https://twitter.com/someone/status/111");
    expect(result.suggestedTitle).not.toBe("未検出");
  });
});
