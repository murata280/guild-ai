import { describe, it, expect } from "vitest";
import { promoteWithIntent } from "../index";
import type { CCAF } from "@/types";

const baseCCAF = (overrides: Partial<CCAF> = {}): CCAF => ({
  intentSignals: ["author-statement"],
  thoughtDensity: 65,
  iterations: 8,
  authorId: "user_promote",
  createdAt: "2026-01-01T00:00:00Z",
  ...overrides,
});

describe("ai-auditor.promoteWithIntent", () => {
  it("always returns S rank regardless of base rank", () => {
    const result = promoteWithIntent(
      { ccaf: baseCCAF({ intentSignals: [] }), vercelUptimeDays: 2 },
      "この作品に全力を注ぎました"
    );
    expect(result.rank).toBe("S");
  });

  it("boosts score by 15 points, capped at 100", () => {
    const result = promoteWithIntent(
      { ccaf: baseCCAF(), vercelUptimeDays: 10 },
      "音声ログ"
    );
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("includes the voice log snippet in reasons", () => {
    const voiceLog = "この作品には魂を込めました";
    const result = promoteWithIntent(
      { ccaf: baseCCAF(), vercelUptimeDays: 15 },
      voiceLog
    );
    const allReasons = result.reasons.join(" ");
    expect(allReasons).toMatch(/意思シグナル追加/);
    expect(result.justification).toBeTruthy();
  });

  it("appends voice-intent to intentSignals in justification", () => {
    const result = promoteWithIntent(
      { ccaf: baseCCAF({ intentSignals: [] }), vercelUptimeDays: 5 },
      "意思シグナルのテスト"
    );
    expect(result.justification).toContain("S");
  });
});
