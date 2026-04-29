import { describe, it, expect } from "vitest";
import { voiceLogToProofOfMake, generateProductPitch } from "../index";

describe("voiceLogToProofOfMake", () => {
  it("extracts intent signals from keywords", () => {
    const result = voiceLogToProofOfMake("設計を丁寧に行いテストを書きました");
    expect(result.intentSignals).toContain("設計レビュー済み");
    expect(result.intentSignals).toContain("テスト駆動開発");
  });

  it("falls back to author-statement for empty transcript", () => {
    const result = voiceLogToProofOfMake("");
    expect(result.intentSignals).toEqual(["author-statement"]);
  });

  it("density increases with more keywords and longer text", () => {
    const short = voiceLogToProofOfMake("テスト");
    const long = voiceLogToProofOfMake("テスト 設計 ユーザー ドキュメント 型 レビュー ".repeat(10));
    expect(long.thoughtDensitySummary).not.toBe(short.thoughtDensitySummary);
    // long has more signals detected
    expect(long.intentSignals.length).toBeGreaterThan(short.intentSignals.length);
  });

  it("refinedDescription truncates at 200 chars with ellipsis", () => {
    const longText = "あ".repeat(300);
    const result = voiceLogToProofOfMake(longText);
    expect(result.refinedDescription).toContain("…");
  });
});

describe("generateProductPitch", () => {
  it("returns description of at most 200 characters", () => {
    const { description } = generateProductPitch("素晴らしい作品です");
    expect(description.length).toBeLessThanOrEqual(200);
    expect(description.length).toBeGreaterThan(10);
  });

  it("returns exactly 5 manual items", () => {
    const { manual } = generateProductPitch("テスト");
    expect(manual).toHaveLength(5);
  });

  it("is deterministic — same transcript gives same result", () => {
    const a = generateProductPitch("同じ入力");
    const b = generateProductPitch("同じ入力");
    expect(a.description).toBe(b.description);
    expect(a.manual).toEqual(b.manual);
  });

  it("description does not contain forbidden jargon", () => {
    const { description } = generateProductPitch("とても良い作品");
    expect(description).not.toContain("CCAF");
  });
});
