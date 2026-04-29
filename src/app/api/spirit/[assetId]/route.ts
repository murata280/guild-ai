import { NextRequest, NextResponse } from "next/server";
import { renderSpiritSvg } from "@/lib/asset-spirit";
import { MOCK_MARKETPLACE } from "@/lib/marketplace";
import type { Rank } from "@/types";

export const dynamic = "force-dynamic";

const VALID_RANKS = new Set<Rank>(["S", "A", "B"]);

export function GET(
  req: NextRequest,
  { params }: { params: { assetId: string } }
) {
  // Determine rank: query param > marketplace lookup > default "B"
  const qRank = req.nextUrl.searchParams.get("rank") as Rank | null;
  let rank: Rank = "B";

  if (qRank && VALID_RANKS.has(qRank)) {
    rank = qRank;
  } else {
    const found = MOCK_MARKETPLACE.find((m) => m.listing.id === params.assetId);
    if (found) rank = found.listing.rank;
  }

  const svg = renderSpiritSvg(params.assetId, rank);
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
