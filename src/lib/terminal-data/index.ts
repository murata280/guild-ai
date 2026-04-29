import type { Rank } from "@/types";

// ─── Types ──────────────────────────────────────────────────

export interface TickerItem {
  id: string;
  label: string;
  score: number;
  delta: number;     // % change
  rank: Rank;
  yield: number;     // annual yield estimate %
}

export interface StreamEntry {
  id: string;
  ts: string;
  type: "purchase" | "royalty" | "deploy" | "audit";
  label: string;
  amount: number;
  rank?: Rank;
}

export interface DeployStatus {
  branch: string;
  commit: string;
  buildState: "READY" | "BUILDING" | "ERROR";
  buildTime: string;
  url: string;
}

// ─── Mock data ──────────────────────────────────────────────

const TICKER_SEED: TickerItem[] = [
  { id: "GUILD-A001", label: "TypeScript設計パターン集", score: 912, delta: +3.2, rank: "S", yield: 18.4 },
  { id: "GUILD-A002", label: "Rustメモリ安全設計",        score: 887, delta: -1.1, rank: "S", yield: 16.9 },
  { id: "GUILD-A003", label: "Next.js App Router設計",    score: 841, delta: +0.7, rank: "A", yield: 12.3 },
  { id: "GUILD-A004", label: "DBスキーマ最適化",           score: 798, delta: +2.4, rank: "A", yield: 10.7 },
  { id: "GUILD-A005", label: "MLパイプライン自動化",       score: 763, delta: -0.5, rank: "A", yield: 9.8  },
  { id: "GUILD-A006", label: "API設計ベストプラクティス",  score: 712, delta: +1.9, rank: "B", yield: 7.2  },
  { id: "GUILD-A007", label: "コードレビューガイド",       score: 689, delta: +0.3, rank: "B", yield: 6.1  },
  { id: "GUILD-A008", label: "CI/CD構築テンプレート",      score: 654, delta: -2.2, rank: "B", yield: 5.3  },
];

const STREAM_SEED: StreamEntry[] = [
  { id: "s001", ts: "2026-04-29T06:18:42Z", type: "purchase", label: "GPT-5 purchased TypeScript設計パターン集",  amount: 4800, rank: "S" },
  { id: "s002", ts: "2026-04-29T06:17:10Z", type: "royalty",  label: "Royalty: agent reuse × 12",               amount: 576  },
  { id: "s003", ts: "2026-04-29T06:15:55Z", type: "audit",    label: "Audit completed — GUILD-A003 → A",        amount: 0,   rank: "A" },
  { id: "s004", ts: "2026-04-29T06:14:32Z", type: "purchase", label: "Claude purchased MLパイプライン自動化",    amount: 3200, rank: "A" },
  { id: "s005", ts: "2026-04-29T06:13:08Z", type: "deploy",   label: "Deploy READY — guild-ai v1.9.1",          amount: 0    },
  { id: "s006", ts: "2026-04-29T06:11:47Z", type: "purchase", label: "Gemini purchased Rustメモリ安全設計",      amount: 5100, rank: "S" },
  { id: "s007", ts: "2026-04-29T06:10:22Z", type: "royalty",  label: "Royalty: lineage × 3 creators",           amount: 288  },
  { id: "s008", ts: "2026-04-29T06:08:55Z", type: "audit",    label: "Audit completed — GUILD-A005 → A",        amount: 0,   rank: "A" },
  { id: "s009", ts: "2026-04-29T06:07:14Z", type: "purchase", label: "o3 purchased API設計ベストプラクティス",   amount: 2100, rank: "B" },
  { id: "s010", ts: "2026-04-29T06:05:38Z", type: "deploy",   label: "Deploy READY — guild-ai v1.9.0",          amount: 0    },
];

export function getTickerSnapshot(): TickerItem[] {
  return TICKER_SEED;
}

export function getStreamFeed(limit = 10): StreamEntry[] {
  return STREAM_SEED.slice(0, limit);
}

export function getDeployStatus(): DeployStatus {
  return {
    branch: "main",
    commit: "111c847",
    buildState: "READY",
    buildTime: "38s",
    url: "https://guild-ai.vercel.app",
  };
}

// Sparkline: 24 points of mock demand history
export function getSparklineData(id: string, points = 24): number[] {
  const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = 600 + (seed % 300);
  return Array.from({ length: points }, (_, i) => {
    const noise = Math.sin(i * 0.7 + seed) * 40 + Math.cos(i * 1.3 + seed * 0.5) * 20;
    return Math.max(400, base + noise + i * 2);
  });
}

// AUM / Yield portfolio stats
export interface PortfolioStats {
  aumJpy: number;
  yieldPct: number;
  momPct: number;
  recipesCount: number;
  recipeAprPct: number;
}

export function getPortfolioStats(): PortfolioStats {
  return {
    aumJpy: 1_240_000,
    yieldPct: 14.7,
    momPct: 8.3,
    recipesCount: 8,
    recipeAprPct: 22.1,
  };
}
