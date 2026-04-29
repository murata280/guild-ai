import { describe, it, expect } from "vitest";
import { crawlPublicSources, updateClaimStatus, getClaimStatus } from "@/lib/crawler";

describe("crawler", () => {
  it("crawlPublicSources() returns exactly 10 items", () => {
    const repos = crawlPublicSources();
    expect(repos).toHaveLength(10);
  });

  it("all items have claimStatus unclaimed initially", () => {
    const repos = crawlPublicSources();
    for (const repo of repos) {
      expect(repo.claimStatus).toBe("unclaimed");
    }
  });

  it("updateClaimStatus changes status", () => {
    const repos = crawlPublicSources();
    const url = repos[0].repoUrl;
    updateClaimStatus(url, "claimed");
    expect(getClaimStatus(url)).toBe("claimed");
    // Reset
    updateClaimStatus(url, "unclaimed");
  });

  it("each item has required fields: source, repoUrl, defaultBranch, topics, summaryFromReadme, lastCommitSha, signals", () => {
    const repos = crawlPublicSources();
    for (const repo of repos) {
      expect(repo.source).toBe("github");
      expect(typeof repo.repoUrl).toBe("string");
      expect(typeof repo.defaultBranch).toBe("string");
      expect(Array.isArray(repo.topics)).toBe(true);
      expect(typeof repo.summaryFromReadme).toBe("string");
      expect(typeof repo.lastCommitSha).toBe("string");
      expect(typeof repo.signals.stars).toBe("number");
      expect(typeof repo.signals.forks).toBe("number");
      expect(typeof repo.signals.recentCommits).toBe("number");
    }
  });

  it("getClaimStatus returns unclaimed for unknown repo", () => {
    expect(getClaimStatus("https://github.com/unknown/repo")).toBe("unclaimed");
  });
});
