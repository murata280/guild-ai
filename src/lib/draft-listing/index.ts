import type { Rank } from "@/types";
import type { CrawledRepo } from "@/lib/crawler";
import { crawlPublicSources } from "@/lib/crawler";

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export interface ProvisionalListing {
  id: string;
  title: string;
  description: string;
  rank: Rank;
  floorPrice: number;
  basePrice: number;
  vercelUptimeDays: number;
  githubUrl: string;
  proofOfMakeNote: string;
  ccaf: {
    thoughtDensity: number;
    iterations: number;
    intentSignals: string[];
  };
  provisional: true;
  claimStatus: "unclaimed" | "verifying" | "claimed";
  valuePool: number;
  repoUrl: string;
  useCases: string[];
}

const RANKS: Rank[] = ["B", "A", "S"];

export function generateDraftCCAF(crawled: CrawledRepo): ProvisionalListing {
  const seed = djb2(crawled.repoUrl);
  const rank = RANKS[Math.min(2, Math.floor((crawled.signals.stars + crawled.signals.recentCommits * 10) / 200))];
  const thoughtDensity = 40 + (seed % 40);
  const iterations = 5 + (seed % 15);
  const intentSignals = crawled.topics.slice(0, 2).map((t) => `#${t}`);
  const basePrice = 3000 + crawled.signals.stars * 10 + crawled.signals.forks * 50;
  const floorPrice = Math.round(basePrice * (rank === "S" ? 1.5 : rank === "A" ? 1.2 : 1.0));

  const useCases = [
    `${crawled.summaryFromReadme.split(".")[0]} を自動化する`,
    `チームの ${crawled.topics[0] ?? "業務"} 効率を向上させる`,
    `${crawled.topics[1] ?? "データ"} 処理を標準化する`,
  ];

  const id = `unclaimed-${(seed % 99999).toString(36)}`;

  return {
    id,
    title: crawled.summaryFromReadme.split(".")[0].trim(),
    description: `${crawled.summaryFromReadme} (未登記 — 権利を主張して正式登録)`,
    rank,
    floorPrice,
    basePrice,
    vercelUptimeDays: 0,
    githubUrl: crawled.repoUrl,
    proofOfMakeNote: `自動生成 CCAF（仮）\n\n考えの深さ: ${thoughtDensity}/100\n試みた回数: ${iterations}\nコミット SHA: ${crawled.lastCommitSha}`,
    ccaf: { thoughtDensity, iterations, intentSignals },
    provisional: true,
    claimStatus: crawled.claimStatus,
    valuePool: crawled.signals.stars * 5 + crawled.signals.forks * 20,
    repoUrl: crawled.repoUrl,
    useCases,
  };
}

export function generateAllDraftListings(): ProvisionalListing[] {
  return crawlPublicSources().map(generateDraftCCAF);
}
