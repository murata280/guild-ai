import { describe, it, expect } from "vitest";
import { listRepos, fetchReadme } from "../index";

describe("fetchReadme", () => {
  it("returns a non-empty string for any repo", () => {
    const repos = listRepos("testuser");
    for (const repo of repos) {
      const readme = fetchReadme(repo);
      expect(typeof readme).toBe("string");
      expect(readme.length).toBeGreaterThan(20);
    }
  });

  it("interpolates the repo fullName into the README content", () => {
    const repos = listRepos("alice");
    const repo = repos[0];
    const readme = fetchReadme(repo);
    expect(readme).toContain(repo.fullName);
  });

  it("is deterministic — same repo always returns same README", () => {
    const repos = listRepos("bob");
    const repo = repos[3];
    expect(fetchReadme(repo)).toBe(fetchReadme(repo));
  });
});
