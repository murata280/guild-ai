// GUILD AI — AtoA Autonomous Marketplace
// Spec: docs/Final-Vision設計.md — 無人マーケット + AtoA sequence.

import type { AgentCatalogEntry, MatchRequest, MatchResult } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuctionSpec {
  task: string;
  budget?: number;
  tags?: string[];
  callerId: string;
}

export interface AuctionResult {
  matchId: string;
  winner: MatchResult;
  runners: MatchResult[];
  agreedPrice: number;
  escrowId: string;
  auctionedAt: string;
}

export interface SettlementResult {
  matchId: string;
  escrowId: string;
  apiKeyId: string;
  settledAt: string;
  amountReleased: number;
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function scoreCandidate(agent: AgentCatalogEntry, spec: AuctionSpec): number {
  const budgetOk = spec.budget == null || agent.floorPrice <= spec.budget;
  if (!budgetOk) return 0;

  let score = agent.trustScore / 1000; // 0-1

  // Tag overlap bonus
  if (spec.tags && spec.tags.length > 0) {
    const overlap = spec.tags.filter((t) => agent.tags.includes(t)).length;
    score += (overlap / spec.tags.length) * 0.3;
  }

  // Rank premium: S=+0.2, A=+0.1, B=0
  if (agent.rank === "S") score += 0.2;
  else if (agent.rank === "A") score += 0.1;

  return Math.min(1, score);
}

function buildReason(agent: AgentCatalogEntry, spec: AuctionSpec): string {
  const parts: string[] = [];
  if (agent.rank === "S") parts.push("Sランクの高品質");
  if (spec.tags?.some((t) => agent.tags.includes(t))) parts.push("タグ一致");
  parts.push(`信用スコア${agent.trustScore}`);
  return parts.join("・");
}

// ─── Catalog mock (used when no external catalog provided) ───────────────────

const MOCK_CATALOG: AgentCatalogEntry[] = [
  { id: "agent_001", title: "文書要約エージェント",  description: "長文をAIが3行に要約", rank: "S", floorPrice: 500,  endpoint: "/api/atoa/agent_001", tags: ["text","summary"], trustScore: 920 },
  { id: "agent_002", title: "コード生成エージェント", description: "要件からコードを自動生成", rank: "A", floorPrice: 800,  endpoint: "/api/atoa/agent_002", tags: ["code","dev"],    trustScore: 780 },
  { id: "agent_003", title: "画像説明エージェント",  description: "画像の内容をテキストで説明", rank: "A", floorPrice: 600,  endpoint: "/api/atoa/agent_003", tags: ["image","text"], trustScore: 750 },
  { id: "agent_004", title: "翻訳エージェント",      description: "多言語自動翻訳",          rank: "B", floorPrice: 300,  endpoint: "/api/atoa/agent_004", tags: ["text","translate"], trustScore: 620 },
  { id: "agent_005", title: "データ分析エージェント", description: "CSVを読み込みインサイト抽出", rank: "S", floorPrice: 1200, endpoint: "/api/atoa/agent_005", tags: ["data","analysis"], trustScore: 880 },
];

// ─── Core functions ───────────────────────────────────────────────────────────

/**
 * Run an autonomous auction: score the catalog, pick top-3, return winner + runners.
 * In production, catalog would be fetched from a live registry.
 */
export function runAutonomousAuction(
  spec: AuctionSpec,
  catalog: AgentCatalogEntry[] = MOCK_CATALOG,
): AuctionResult {
  const scored = catalog
    .map((agent) => ({
      agent,
      confidence: scoreCandidate(agent, spec),
      reason: buildReason(agent, spec),
    }))
    .filter((r) => r.confidence > 0)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  if (scored.length === 0) {
    throw new Error("No agents matched the auction spec");
  }

  const [winner, ...runners] = scored;
  const agreedPrice = winner.agent.floorPrice;
  const matchId = `match_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const escrowId = `esw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  return {
    matchId,
    winner,
    runners,
    agreedPrice,
    escrowId,
    auctionedAt: new Date().toISOString(),
  };
}

/**
 * Confirm settlement: release escrow and issue API key.
 * In production, this would call the escrow and api-gateway services.
 */
export function recordSettlement(
  matchId: string,
  escrowId: string,
  amountReleased: number,
): SettlementResult {
  const apiKeyId = `key_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  return {
    matchId,
    escrowId,
    apiKeyId,
    settledAt: new Date().toISOString(),
    amountReleased,
  };
}
