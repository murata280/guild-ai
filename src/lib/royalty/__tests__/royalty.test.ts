import { describe, it, expect } from "vitest";
import { distributeRoyalty } from "../index";
import type { Creator } from "@/types";

const THREE_GEN: Creator[] = [
  { creatorId: "c-001", name: "曾祖父クリエイター" },
  { creatorId: "c-002", name: "祖父クリエイター" },
  { creatorId: "c-003", name: "親クリエイター" },
];

describe("distributeRoyalty — 3世代の系譜", () => {
  it("直接の親 (gen 1) が 15%、祖父 (gen 2) が 7%、曾祖父 (gen 3) が 3% を受け取る", () => {
    const result = distributeRoyalty(100000, THREE_GEN);
    const [gen1, gen2, gen3] = result.distributions;

    expect(gen1.generation).toBe(1);
    expect(gen1.amount).toBe(15000); // 15%
    expect(gen2.generation).toBe(2);
    expect(gen2.amount).toBe(7000);  // 7%
    expect(gen3.generation).toBe(3);
    expect(gen3.amount).toBe(3000);  // 3%
  });

  it("合計ロイヤリティは 25%（¥25,000）、売り手の取り分は ¥75,000", () => {
    const result = distributeRoyalty(100000, THREE_GEN);
    expect(result.totalRoyaltyPaid).toBe(25000);
    expect(result.sellerNet).toBe(75000);
  });

  it("Trust Score ボーナスが世代ごとに減衰する (10 / 5 / 2)", () => {
    const result = distributeRoyalty(100000, THREE_GEN);
    expect(result.distributions[0].trustScoreBonus).toBe(10);
    expect(result.distributions[1].trustScoreBonus).toBe(5);
    expect(result.distributions[2].trustScoreBonus).toBe(2);
  });

  it("lineage の末尾（最新クリエイター）が gen 1 として扱われる", () => {
    const result = distributeRoyalty(100000, THREE_GEN);
    expect(result.distributions[0].creatorId).toBe("c-003"); // 親
    expect(result.distributions[1].creatorId).toBe("c-002"); // 祖父
    expect(result.distributions[2].creatorId).toBe("c-001"); // 曾祖父
  });
});

describe("distributeRoyalty — エッジケース", () => {
  it("1世代のみの場合、親だけが 15% を受け取る", () => {
    const result = distributeRoyalty(50000, [{ creatorId: "c-001", name: "親" }]);
    expect(result.distributions.length).toBe(1);
    expect(result.distributions[0].amount).toBe(7500); // 15% of 50000
    expect(result.totalRoyaltyPaid).toBe(7500);
    expect(result.sellerNet).toBe(42500);
  });

  it("2世代の場合、3世代目の配当はゼロ（= distributions.length が 2）", () => {
    const twoGen: Creator[] = [
      { creatorId: "c-001", name: "祖父" },
      { creatorId: "c-002", name: "親" },
    ];
    const result = distributeRoyalty(100000, twoGen);
    expect(result.distributions.length).toBe(2);
    expect(result.totalRoyaltyPaid).toBe(22000); // 15% + 7%
    expect(result.sellerNet).toBe(78000);
  });

  it("空の系譜の場合、ロイヤリティはゼロで売り手が全額受け取る", () => {
    const result = distributeRoyalty(10000, []);
    expect(result.distributions.length).toBe(0);
    expect(result.totalRoyaltyPaid).toBe(0);
    expect(result.sellerNet).toBe(10000);
  });

  it("saleAmount が 0 の場合、全額ゼロ", () => {
    const result = distributeRoyalty(0, THREE_GEN);
    expect(result.totalRoyaltyPaid).toBe(0);
    expect(result.sellerNet).toBe(0);
    expect(result.distributions.every((d) => d.amount === 0)).toBe(true);
  });
});
