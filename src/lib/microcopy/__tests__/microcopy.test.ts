import { describe, it, expect } from "vitest";
import { messages } from "../index";

describe("microcopy dictionary", () => {
  it("notFound has non-empty heading and body", () => {
    expect(messages.notFound.heading.length).toBeGreaterThan(10);
    expect(messages.notFound.body.length).toBeGreaterThan(10);
    expect(messages.notFound.ctaMarketplace).toBeTruthy();
    expect(messages.notFound.ctaHome).toBeTruthy();
  });

  it("transaction messages are polite Japanese (contain です or ます)", () => {
    const transactionKeys = [
      "listingPublished",
      "purchaseDone",
      "auditDone",
      "rankUpToS",
    ] as const;
    for (const key of transactionKeys) {
      const msg = messages[key];
      const isPolite = msg.includes("です") || msg.includes("ます") || msg.includes("ました");
      expect(isPolite, `${key} should use 敬体`).toBe(true);
    }
  });

  it("contextual help messages are concise (under 80 chars each)", () => {
    const helpKeys = [
      "helpDigitalYen",
      "helpTrustScore",
      "helpSRank",
      "helpEndpoint",
      "helpFloorPrice",
    ] as const;
    for (const key of helpKeys) {
      expect(messages[key].length, `${key} should be concise`).toBeLessThanOrEqual(80);
    }
  });

  it("no forbidden tech jargon in UI messages (JPYC, Stablecoin, CCAF, API Hotbed)", () => {
    const forbidden = ["JPYC", "ステーブルコイン", "Stablecoin", "CCAF", "API Hotbed"];
    const allText = JSON.stringify(messages);
    for (const term of forbidden) {
      expect(allText, `"${term}" should not appear in microcopy`).not.toContain(term);
    }
  });

  it("listingPublished uses concierge tone (登録されました)", () => {
    expect(messages.listingPublished).toContain("登録されました");
  });

  it("auditInProgress uses concierge tone (拝見しております)", () => {
    expect(messages.auditInProgress).toContain("拝見しております");
  });
});
