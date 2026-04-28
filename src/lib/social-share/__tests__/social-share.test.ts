import { describe, it, expect } from "vitest";
import {
  generateShareText,
  buildXShareUrl,
  buildLineShareUrl,
  SHARE_TEMPLATES,
  type ShareContext,
} from "../index";

describe("generateShareText", () => {
  it("returns a non-empty string for every context type", () => {
    const types = [
      "listing_published",
      "purchase_done",
      "rank_up_s",
      "atoa_job",
      "passbook_milestone",
    ] as const;
    for (const type of types) {
      const text = generateShareText({ type }, 0);
      expect(text.length, `${type} should produce non-empty text`).toBeGreaterThan(10);
    }
  });

  it("is deterministic when seed is provided", () => {
    const ctx: ShareContext = { type: "listing_published" };
    expect(generateShareText(ctx, 0)).toBe(generateShareText(ctx, 0));
    expect(generateShareText(ctx, 1)).toBe(generateShareText(ctx, 1));
  });

  it("seed 0, 1, 2 each pick a different template within the same context", () => {
    const ctx: ShareContext = { type: "rank_up_s" };
    const t0 = generateShareText(ctx, 0);
    const t1 = generateShareText(ctx, 1);
    const t2 = generateShareText(ctx, 2);
    expect(t0).not.toBe(t1);
    expect(t1).not.toBe(t2);
  });

  it("all templates contain #GUILDAI hashtag", () => {
    for (const [type, templates] of Object.entries(SHARE_TEMPLATES)) {
      for (const tpl of templates) {
        expect(tpl, `${type} template missing #GUILDAI`).toContain("#GUILDAI");
      }
    }
  });

  it("listing_published templates invoke curiosity (contain '?' or 'ですか')", () => {
    for (const tpl of SHARE_TEMPLATES.listing_published) {
      const hasHook = tpl.includes("？") || tpl.includes("?") || tpl.includes("ですか") || tpl.includes("できる");
      expect(hasHook, "listing_published should have a hook").toBe(true);
    }
  });

  it("rank_up_s templates contain お墨付き hashtag", () => {
    for (const tpl of SHARE_TEMPLATES.rank_up_s) {
      expect(tpl).toContain("#お墨付き");
    }
  });

  it("no template exceeds 200 characters (X-safe with URL headroom)", () => {
    for (const [type, templates] of Object.entries(SHARE_TEMPLATES)) {
      for (const tpl of templates) {
        expect(tpl.length, `${type} template too long`).toBeLessThanOrEqual(200);
      }
    }
  });
});

describe("buildXShareUrl", () => {
  it("returns an x.com intent URL with text param", () => {
    const url = buildXShareUrl("テストテキスト");
    expect(url).toContain("https://x.com/intent/tweet");
    expect(url).toContain("text=");
    expect(url).toContain(encodeURIComponent("テストテキスト"));
  });

  it("appends url to tweet text when provided", () => {
    const url = buildXShareUrl("シェアする", "https://guild-ai.vercel.app");
    expect(url).toContain(encodeURIComponent("https://guild-ai.vercel.app"));
  });
});

describe("buildLineShareUrl", () => {
  it("returns a LINE share URL with url and text params", () => {
    const url = buildLineShareUrl("テスト", "https://guild-ai.vercel.app");
    expect(url).toContain("social-plugins.line.me/lineit/share");
    expect(url).toContain("text=");
    expect(url).toContain("url=");
  });
});
