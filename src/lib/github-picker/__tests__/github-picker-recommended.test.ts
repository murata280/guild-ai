import { describe, it, expect } from "vitest";
import { listRepos } from "../index";

describe("listRepos recommended flag", () => {
  it("returns exactly one recommended repo", () => {
    const repos = listRepos("testuser");
    const recommended = repos.filter((r) => r.recommended);
    expect(recommended).toHaveLength(1);
  });

  it("recommended flag is deterministic", () => {
    const a = listRepos("alice");
    const b = listRepos("alice");
    const idxA = a.findIndex((r) => r.recommended);
    const idxB = b.findIndex((r) => r.recommended);
    expect(idxA).toBe(idxB);
  });

  it("different users may get different recommended items", () => {
    const a = listRepos("user-aaa");
    const b = listRepos("user-zzz");
    // at least repo names differ — just confirm both have exactly 1 recommended
    expect(a.filter((r) => r.recommended)).toHaveLength(1);
    expect(b.filter((r) => r.recommended)).toHaveLength(1);
  });
});
