import { describe, it, expect } from "vitest";
import { mapToEmotionalTags, EMOTIONAL_TAGS_BY_RANK } from "../index";
import { MOCK_MARKETPLACE } from "@/lib/marketplace";

describe("mapToEmotionalTags", () => {
  it("is deterministic — same asset returns same tags", () => {
    const asset = MOCK_MARKETPLACE[0];
    const first = mapToEmotionalTags(asset);
    const second = mapToEmotionalTags(asset);
    expect(first).toEqual(second);
  });

  it("returns exactly 3 tags", () => {
    for (const asset of MOCK_MARKETPLACE) {
      expect(mapToEmotionalTags(asset)).toHaveLength(3);
    }
  });

  it("S rank pool includes '神UI'", () => {
    expect(EMOTIONAL_TAGS_BY_RANK.S).toContain("神UI");
  });

  it("B rank never includes '神UI' or '魔法レベル'", () => {
    const bRankAssets = MOCK_MARKETPLACE.filter((a) => a.listing.rank === "B");
    for (const asset of bRankAssets) {
      const tags = mapToEmotionalTags(asset);
      expect(tags).not.toContain("神UI");
      expect(tags).not.toContain("魔法レベル");
    }
  });
});
