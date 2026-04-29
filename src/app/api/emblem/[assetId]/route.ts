import { NextRequest, NextResponse } from "next/server";
import { generateEmblemSpec, renderEmblemSvg } from "@/lib/asset-emblem";

export const dynamic = "force-dynamic";

export function GET(
  _req: NextRequest,
  { params }: { params: { assetId: string } }
) {
  const spec = generateEmblemSpec(params.assetId);
  const svg = renderEmblemSvg(spec);
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
