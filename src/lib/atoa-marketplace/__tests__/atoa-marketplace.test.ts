import { describe, it, expect } from "vitest";
import { runAutonomousAuction, recordSettlement } from "../index";
import type { AgentCatalogEntry } from "@/types";

const CATALOG: AgentCatalogEntry[] = [
  { id: "a1", title: "要約エージェント", description: "要約",  rank: "S", floorPrice: 500,  endpoint: "/api/atoa/a1", tags: ["text","summary"], trustScore: 900 },
  { id: "a2", title: "翻訳エージェント", description: "翻訳",  rank: "A", floorPrice: 400,  endpoint: "/api/atoa/a2", tags: ["text","translate"], trustScore: 700 },
  { id: "a3", title: "コード生成",       description: "コード", rank: "B", floorPrice: 800,  endpoint: "/api/atoa/a3", tags: ["code"],           trustScore: 600 },
];

describe("runAutonomousAuction", () => {
  it("returns a winner and at most 2 runners", () => {
    const result = runAutonomousAuction({ task: "テキスト要約", callerId: "user_1" }, CATALOG);
    expect(result.winner).toBeDefined();
    expect(result.runners.length).toBeLessThanOrEqual(2);
  });

  it("winner has highest confidence among all candidates", () => {
    const result = runAutonomousAuction({ task: "要約", tags: ["text","summary"], callerId: "user_1" }, CATALOG);
    for (const runner of result.runners) {
      expect(result.winner.confidence).toBeGreaterThanOrEqual(runner.confidence);
    }
  });

  it("respects budget — excludes agents above budget", () => {
    // a3 costs 800, budget is 500 → only a1 (500) and a2 (400) qualify
    const result = runAutonomousAuction({ task: "test", budget: 500, callerId: "user_1" }, CATALOG);
    expect(result.winner.agent.floorPrice).toBeLessThanOrEqual(500);
  });

  it("throws when no agents match the budget", () => {
    expect(() =>
      runAutonomousAuction({ task: "test", budget: 10, callerId: "user_1" }, CATALOG)
    ).toThrow();
  });

  it("generates unique matchId and escrowId", () => {
    const r1 = runAutonomousAuction({ task: "x", callerId: "u1" }, CATALOG);
    const r2 = runAutonomousAuction({ task: "x", callerId: "u1" }, CATALOG);
    expect(r1.matchId).not.toBe(r2.matchId);
    expect(r1.escrowId).not.toBe(r2.escrowId);
  });
});

describe("recordSettlement", () => {
  it("returns a settlement with apiKeyId and correct amount", () => {
    const s = recordSettlement("match_1", "esw_1", 500);
    expect(s.matchId).toBe("match_1");
    expect(s.escrowId).toBe("esw_1");
    expect(s.amountReleased).toBe(500);
    expect(s.apiKeyId).toMatch(/^key_/);
    expect(s.settledAt).toBeTruthy();
  });
});
