import { describe, it, expect } from "vitest";
import { listRepos } from "../index";

describe("listRepos", () => {
  it("returns exactly 10 repos", () => {
    expect(listRepos("testuser")).toHaveLength(10);
  });

  it("is deterministic — same user returns same repos", () => {
    const a = listRepos("alice");
    const b = listRepos("alice");
    expect(a[0].id).toBe(b[0].id);
    expect(a[0].url).toBe(b[0].url);
    expect(a[0].stars).toBe(b[0].stars);
  });

  it("uses the username in fullName and url", () => {
    const repos = listRepos("bob");
    for (const repo of repos) {
      expect(repo.fullName.startsWith("bob/")).toBe(true);
      expect(repo.url).toContain("bob");
    }
  });
});
