import { describe, it, expect } from "vitest";
import { STEPS } from "../index";

describe("onboarding STEPS", () => {
  it("has exactly 4 steps", () => {
    expect(STEPS).toHaveLength(4);
  });

  it("all steps are non-empty strings", () => {
    for (const step of STEPS) {
      expect(typeof step).toBe("string");
      expect(step.length).toBeGreaterThan(5);
    }
  });

  it("first step mentions 30秒", () => {
    expect(STEPS[0]).toContain("30秒");
  });

  it("last step guides to お店に並べる", () => {
    expect(STEPS[3]).toContain("お店に並べる");
  });
});
