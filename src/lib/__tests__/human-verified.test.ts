import { describe, it, expect } from "vitest";
import { getVerificationLevel, applyHumanPremium } from "@/lib/human-verified";

describe("human-verified", () => {
  describe("getVerificationLevel", () => {
    it("returns ai-generated for provisional listings", () => {
      expect(getVerificationLevel({ provisional: true })).toBe("ai-generated");
      expect(getVerificationLevel({ provisional: true, claimStatus: "claimed", trustScore: 700 })).toBe("ai-generated");
    });

    it("returns human-verified-gold when claimed and trustScore >= 600", () => {
      expect(getVerificationLevel({ claimStatus: "claimed", trustScore: 600 })).toBe("human-verified-gold");
      expect(getVerificationLevel({ claimStatus: "claimed", trustScore: 800 })).toBe("human-verified-gold");
      expect(getVerificationLevel({ claimStatus: "claimed", trustScore: 1000 })).toBe("human-verified-gold");
    });

    it("returns human-claimed when claimed and trustScore < 600", () => {
      expect(getVerificationLevel({ claimStatus: "claimed", trustScore: 599 })).toBe("human-claimed");
      expect(getVerificationLevel({ claimStatus: "claimed", trustScore: 0 })).toBe("human-claimed");
      expect(getVerificationLevel({ claimStatus: "claimed" })).toBe("human-claimed");
    });

    it("returns ai-generated when not claimed and not provisional", () => {
      expect(getVerificationLevel({})).toBe("ai-generated");
      expect(getVerificationLevel({ claimStatus: "unclaimed", trustScore: 900 })).toBe("ai-generated");
    });
  });

  describe("applyHumanPremium", () => {
    it("applies 1.5x multiplier for human-verified-gold", () => {
      expect(applyHumanPremium(10000, "human-verified-gold")).toBe(15000);
    });

    it("applies 1.2x multiplier for human-claimed", () => {
      expect(applyHumanPremium(10000, "human-claimed")).toBe(12000);
    });

    it("applies 0.7x multiplier for ai-generated", () => {
      expect(applyHumanPremium(10000, "ai-generated")).toBe(7000);
    });

    it("prices are rounded integers", () => {
      const gold = applyHumanPremium(7777, "human-verified-gold");
      const claimed = applyHumanPremium(7777, "human-claimed");
      const ai = applyHumanPremium(7777, "ai-generated");
      expect(Number.isInteger(gold)).toBe(true);
      expect(Number.isInteger(claimed)).toBe(true);
      expect(Number.isInteger(ai)).toBe(true);
    });
  });
});
