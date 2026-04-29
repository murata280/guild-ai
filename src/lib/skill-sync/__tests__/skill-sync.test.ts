import { describe, it, expect } from "vitest";
import { getGithubGreenScore, getLearningProgress, applySkillBoost } from "../index";

describe("getGithubGreenScore", () => {
  it("returns a value in range 0-100", () => {
    const score = getGithubGreenScore("octocat");
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("is deterministic for the same username", () => {
    expect(getGithubGreenScore("octocat")).toBe(getGithubGreenScore("octocat"));
  });
});

describe("getLearningProgress", () => {
  it("returns a value in range 0-20", () => {
    const p = getLearningProgress("user_1");
    expect(p).toBeGreaterThanOrEqual(0);
    expect(p).toBeLessThanOrEqual(20);
  });

  it("is deterministic for the same userId", () => {
    expect(getLearningProgress("user_abc")).toBe(getLearningProgress("user_abc"));
  });
});

describe("applySkillBoost", () => {
  it("gives +1 rank when greenScore≥70 and learningProgress≥10", () => {
    expect(applySkillBoost("B", 70, 10)).toBe("A");
    expect(applySkillBoost("A", 70, 10)).toBe("S");
  });

  it("gives +2 ranks when greenScore≥85 and learningProgress≥17", () => {
    expect(applySkillBoost("B", 85, 17)).toBe("S");
  });

  it("caps at S rank", () => {
    expect(applySkillBoost("S", 90, 20)).toBe("S");
    expect(applySkillBoost("A", 90, 20)).toBe("S");
  });

  it("returns unchanged rank when thresholds not met", () => {
    expect(applySkillBoost("B", 50, 5)).toBe("B");
    expect(applySkillBoost("A", 69, 9)).toBe("A");
  });
});
