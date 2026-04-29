import { describe, it, expect } from "vitest";
import { generatePersonaCards } from "@/lib/persona-cards";
import { MOCK_MARKETPLACE } from "@/lib/marketplace";

const item = MOCK_MARKETPLACE[0];

describe("generatePersonaCards", () => {
  it("returns all 3 personas", () => {
    const cards = generatePersonaCards(item);
    expect(cards).toHaveProperty("general");
    expect(cards).toHaveProperty("pm");
    expect(cards).toHaveProperty("engineer");
  });

  it("each persona has a non-empty headline", () => {
    const cards = generatePersonaCards(item);
    expect(cards.general.headline.length).toBeGreaterThan(0);
    expect(cards.pm.headline.length).toBeGreaterThan(0);
    expect(cards.engineer.headline.length).toBeGreaterThan(0);
  });

  it("each persona has at least 2 bullets", () => {
    const cards = generatePersonaCards(item);
    expect(cards.general.bullets.length).toBeGreaterThanOrEqual(2);
    expect(cards.pm.bullets.length).toBeGreaterThanOrEqual(2);
    expect(cards.engineer.bullets.length).toBeGreaterThanOrEqual(2);
  });

  it("each persona has at least 2 emotional tags", () => {
    const cards = generatePersonaCards(item);
    expect(cards.general.emotionalTags.length).toBeGreaterThanOrEqual(2);
    expect(cards.pm.emotionalTags.length).toBeGreaterThanOrEqual(2);
    expect(cards.engineer.emotionalTags.length).toBeGreaterThanOrEqual(2);
  });

  it("each persona has non-empty priceCallout and ctaLabel", () => {
    const cards = generatePersonaCards(item);
    for (const persona of ["general", "pm", "engineer"] as const) {
      expect(cards[persona].priceCallout.length).toBeGreaterThan(0);
      expect(cards[persona].ctaLabel.length).toBeGreaterThan(0);
    }
  });

  it("PM persona includes rank in bullets", () => {
    const cards = generatePersonaCards(item);
    const allBullets = cards.pm.bullets.join(" ");
    expect(allBullets).toContain(`ランク ${item.listing.rank}`);
  });

  it("engineer persona includes /api/atoa/ in bullets", () => {
    const cards = generatePersonaCards(item);
    const allBullets = cards.engineer.bullets.join(" ");
    expect(allBullets).toContain("/api/atoa/");
  });
});
