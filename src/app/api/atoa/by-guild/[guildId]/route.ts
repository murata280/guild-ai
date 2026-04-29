import { NextRequest, NextResponse } from "next/server";
import { MOCK_MARKETPLACE } from "@/lib/marketplace";
import { mintGuildIdForAsset } from "@/lib/guild-id";

export async function GET(
  _req: NextRequest,
  { params }: { params: { guildId: string } }
) {
  const searchGuildId = `GUILD:${params.guildId.toUpperCase()}`;
  const item = MOCK_MARKETPLACE.find(
    (m) => mintGuildIdForAsset(m.listing.id) === searchGuildId
  );
  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({
    guildId: searchGuildId,
    assetId: item.listing.id,
    title: item.listing.title,
    rank: item.listing.rank,
    endpoint: `/api/atoa/${item.listing.id}`,
  });
}
