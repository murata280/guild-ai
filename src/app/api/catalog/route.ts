import { NextResponse } from "next/server";
import { MOCK_MARKETPLACE } from "@/lib/marketplace";
import type { AgentCatalogEntry } from "@/types";

export const dynamic = "force-dynamic";

export function GET() {
  const agents: AgentCatalogEntry[] = MOCK_MARKETPLACE.map((m) => ({
    id: m.listing.id,
    title: m.listing.title,
    description: m.listing.description,
    rank: m.listing.rank,
    floorPrice: m.listing.floorPrice,
    endpoint: `https://guild-ai.vercel.app/api/atoa/${m.listing.id}`,
    tags: m.listing.ccaf.intentSignals,
    trustScore: m.trustScore.score,
  }));

  return NextResponse.json({ agents, count: agents.length, updatedAt: new Date().toISOString() });
}
