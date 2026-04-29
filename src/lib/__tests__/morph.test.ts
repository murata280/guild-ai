import { describe, it, expect } from "vitest";
import { assignMorphTag, startViewTransition } from "@/lib/morph";

describe("morph library", () => {
  describe("assignMorphTag", () => {
    it("returns a string matching morph-{rank}-{hex} pattern", () => {
      const tag = assignMorphTag("asset-001", "S");
      expect(tag).toMatch(/^morph-s-[0-9a-f]{4}$/);
    });

    it("uses lowercase rank in tag", () => {
      expect(assignMorphTag("x", "A")).toMatch(/^morph-a-/);
      expect(assignMorphTag("x", "B")).toMatch(/^morph-b-/);
      expect(assignMorphTag("x", "S")).toMatch(/^morph-s-/);
    });

    it("is deterministic — same assetId returns same tag", () => {
      const tag1 = assignMorphTag("asset-42", "A");
      const tag2 = assignMorphTag("asset-42", "A");
      expect(tag1).toBe(tag2);
    });

    it("different assetIds produce different tags", () => {
      const tag1 = assignMorphTag("asset-001", "S");
      const tag2 = assignMorphTag("asset-999", "S");
      expect(tag1).not.toBe(tag2);
    });

    it("rank changes produce different tags for same assetId", () => {
      const tagS = assignMorphTag("asset-001", "S");
      const tagA = assignMorphTag("asset-001", "A");
      expect(tagS).not.toBe(tagA);
    });
  });

  describe("startViewTransition", () => {
    it("is exported and callable", () => {
      expect(typeof startViewTransition).toBe("function");
    });

    it("calls the callback synchronously when startViewTransition is not available", () => {
      let called = false;
      startViewTransition(() => { called = true; });
      expect(called).toBe(true);
    });
  });
});
