import type { PassbookSnapshot, PassbookTransaction } from "@/types";

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const ASSET_TITLES = [
  "自然言語解析エンジン",
  "画像分類API v2",
  "チャットボット基盤",
  "コード補完モデル",
  "感情分析サービス",
];

const PAYMENT_TYPES: Array<"card" | "jpyc"> = ["card", "jpyc"];

export function getPassbookSnapshot(userId: string): PassbookSnapshot {
  const seed = djb2(userId);

  const jpycBalance = 1000 + (seed % 9001);
  const trustScore = 300 + (djb2(userId + "_ts") % 701);
  const assetCount = 1 + (djb2(userId + "_ac") % 12);

  const sCount = Math.floor(assetCount * 0.2);
  const aCount = Math.floor(assetCount * 0.5);
  const bCount = assetCount - sCount - aCount;

  const trustHistory: number[] = Array.from({ length: 7 }, (_, i) => {
    const base = trustScore - 50 + (djb2(userId + `_h${i}`) % 100);
    return Math.max(0, Math.min(1000, base));
  });

  const recentTransactions: PassbookTransaction[] = Array.from({ length: 3 }, (_, i) => {
    const txSeed = djb2(userId + `_tx${i}`);
    return {
      id: `tx_${txSeed.toString(36)}`,
      type: PAYMENT_TYPES[txSeed % 2],
      amount: 1000 + (txSeed % 9001),
      assetTitle: ASSET_TITLES[txSeed % ASSET_TITLES.length],
      at: new Date(Date.now() - i * 86400000 * 2).toISOString(),
    };
  });

  return {
    userId,
    jpycBalance,
    trustScore,
    assetCount,
    rankBreakdown: { S: sCount, A: aCount, B: bCount },
    recentTransactions,
    trustHistory,
  };
}

export interface MonthlyEarnings {
  jpy: number;
  aiJobs: number;
  assetCount: number;
  momGrowthPct: number;
  breakdown: Array<{ label: string; amount: number }>;
}

export function getMonthlyEarnings(userId: string): MonthlyEarnings {
  const seed = djb2(userId + "_monthly");
  const jpy = 8000 + (seed % 12001);
  const aiJobs = 20 + (seed % 50);
  const assetCount = 1 + (seed % 8);
  const momGrowthPct = 10 + (seed % 35);

  const aiJobAmount = Math.round(jpy * 0.7);
  const royaltyAmount = Math.round(jpy * 0.2);
  const bonusAmount = jpy - aiJobAmount - royaltyAmount;

  return {
    jpy,
    aiJobs,
    assetCount,
    momGrowthPct,
    breakdown: [
      { label: "お仕事の入金", amount: aiJobAmount },
      { label: "ロイヤリティ受領", amount: royaltyAmount },
      { label: "公開ボーナス", amount: bonusAmount },
    ],
  };
}
