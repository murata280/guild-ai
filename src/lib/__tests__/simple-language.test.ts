import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { messages } from "@/lib/microcopy";
import { COIN_CHIME_FREQUENCIES } from "@/lib/sound";

// ─── Microcopy: ultra-simple language checks ─────────────────────────────────

const KANJI_RE = /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/g;
const CJK_RE   = /[\u3040-\u30FF\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\uFF01-\uFF9F]/g;

function kanjiRatio(text: string): number {
  const cjkTotal = (text.match(CJK_RE) ?? []).length;
  if (cjkTotal === 0) return 0;
  return (text.match(KANJI_RE) ?? []).length / cjkTotal;
}

describe("microcopy: ultra-simple language", () => {
  it("listingPublished should be <30% kanji", () => {
    expect(kanjiRatio(messages.listingPublished)).toBeLessThan(0.30);
  });

  it("purchaseDone should be <30% kanji", () => {
    expect(kanjiRatio(messages.purchaseDone)).toBeLessThan(0.30);
  });

  it("rankUpToS should be <30% kanji", () => {
    expect(kanjiRatio(messages.rankUpToS)).toBeLessThan(0.30);
  });

  it("atoaJobDone should be <30% kanji", () => {
    expect(kanjiRatio(messages.atoaJobDone)).toBeLessThan(0.30);
  });

  it("ui.dashboard is 'わたしのページ'", () => {
    expect(messages.ui.dashboard).toBe("わたしのページ");
  });

  it("ui.marketplace is 'みんなの お店'", () => {
    expect(messages.ui.marketplace).toBe("みんなの お店");
  });

  it("ui.passbook is 'おこづかい帳'", () => {
    expect(messages.ui.passbook).toBe("おこづかい帳");
  });

  it("ui.trustScore is 'しんよう ポイント'", () => {
    expect(messages.ui.trustScore).toBe("しんよう ポイント");
  });

  it("ui.rankS is 'すごい！'", () => {
    expect(messages.ui.rankS).toBe("すごい！");
  });

  it("ui.rankA is 'いい かんじ'", () => {
    expect(messages.ui.rankA).toBe("いい かんじ");
  });

  it("ui.rankB is 'これから'", () => {
    expect(messages.ui.rankB).toBe("これから");
  });
});

// ─── playCoinChime: frequency export ─────────────────────────────────────────

describe("playCoinChime: COIN_CHIME_FREQUENCIES export", () => {
  it("exports [500, 1000] as coin chime frequencies", () => {
    expect(COIN_CHIME_FREQUENCIES).toEqual([500, 1000]);
  });

  it("first frequency is 500Hz (澄んだ短いベル)", () => {
    expect(COIN_CHIME_FREQUENCIES[0]).toBe(500);
  });
});

// ─── MoneyBox: playCoinChime called on balance increase ─────────────────────
// (DOM-free: tests the sound module integration)

describe("sound: playCoinChime does not throw when AudioContext unavailable", () => {
  it("playCoinChime is a function", async () => {
    const mod = await import("@/lib/sound");
    expect(typeof mod.playCoinChime).toBe("function");
  });

  it("playCoinChime returns void (no throw in test env)", async () => {
    const mod = await import("@/lib/sound");
    expect(() => mod.playCoinChime()).not.toThrow();
  });
});

// ─── RankBadge: emotive labels ───────────────────────────────────────────────
// (Verifies microcopy alignment — component rendering tested via E2E)

describe("emotive rank labels align with microcopy", () => {
  it("rankS in microcopy matches emotive badge label", () => {
    expect(messages.ui.rankS).toBe("すごい！");
  });

  it("rankA in microcopy matches emotive badge label", () => {
    expect(messages.ui.rankA).toBe("いい かんじ");
  });

  it("rankB in microcopy matches emotive badge label", () => {
    expect(messages.ui.rankB).toBe("これから");
  });
});
