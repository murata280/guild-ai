import { NextRequest, NextResponse } from "next/server";
import { MOCK_MARKETPLACE } from "@/lib/marketplace";
import type { AgentCatalogEntry, MatchRequest, MatchResult } from "@/types";

export const dynamic = "force-dynamic";

function scoreAgent(entry: AgentCatalogEntry, req: MatchRequest): number {
  let score = 0;
  const taskLower = req.task.toLowerCase();

  // keyword match against title + description + tags
  const corpus = `${entry.title} ${entry.description} ${entry.tags.join(" ")}`.toLowerCase();
  const words = taskLower.split(/\s+/).filter(Boolean);
  for (const w of words) {
    if (corpus.includes(w)) score += 10;
  }

  // trust score bonus (0-10 points)
  score += Math.floor(entry.trustScore / 100);

  // rank bonus
  if (entry.rank === "S") score += 5;
  else if (entry.rank === "A") score += 3;

  // budget filter — hard exclude if over budget
  if (req.budget !== undefined && entry.floorPrice > req.budget) return -1;

  return score;
}

export async function POST(req: NextRequest) {
  let body: MatchRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.task || typeof body.task !== "string") {
    return NextResponse.json({ error: '"task" field is required' }, { status: 400 });
  }

  const catalog: AgentCatalogEntry[] = MOCK_MARKETPLACE.map((m) => ({
    id: m.listing.id,
    title: m.listing.title,
    description: m.listing.description,
    rank: m.listing.rank,
    floorPrice: m.listing.floorPrice,
    endpoint: `https://guild-ai.vercel.app/api/atoa/${m.listing.id}`,
    tags: m.listing.ccaf.intentSignals,
    trustScore: m.trustScore.score,
  }));

  const scored = catalog
    .map((agent) => ({ agent, score: scoreAgent(agent, body) }))
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    return NextResponse.json({ error: "No matching agent found within budget" }, { status: 404 });
  }

  const best = scored[0];
  const totalScore = scored.reduce((sum, x) => sum + x.score, 0);
  const confidence = totalScore > 0 ? Math.min(1, best.score / totalScore) : 0;

  const result: MatchResult = {
    agent: best.agent,
    confidence: parseFloat(confidence.toFixed(3)),
    reason: `Matched on task keywords against title/description. Rank: ${best.agent.rank}, 信用スコア: ${best.agent.trustScore}.`,
  };

  return NextResponse.json(result);
}
