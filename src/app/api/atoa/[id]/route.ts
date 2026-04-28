import { NextRequest, NextResponse } from "next/server";
import { MOCK_MARKETPLACE } from "@/lib/marketplace";
import { runWithQA } from "@/lib/atoa-runner";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer gld_")) {
    return NextResponse.json(
      { error: "GUILD-E401: Missing or invalid Authorization header. Expected: Bearer gld_<ACCESS_KEY>" },
      { status: 401 }
    );
  }

  const agent = MOCK_MARKETPLACE.find((m) => m.listing.id === params.id);
  if (!agent) {
    return NextResponse.json({ error: `GUILD-E404: Agent ${params.id} not found` }, { status: 404 });
  }

  let body: { input?: string; agentId?: string; sessionId?: string } = {};
  try {
    body = await req.json();
  } catch {
    // allow empty body
  }

  const input = typeof body.input === "string" ? body.input : "No input provided";
  const result = runWithQA(params.id, input);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "GUILD-E502: Agent execution degraded. Refund issued.",
        refundIssued: true,
        instanceId: result.instanceId,
        reason: result.refundReason,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    agentId: params.id,
    instanceId: result.instanceId,
    output: result.output,
    durationMs: result.durationMs,
    billedJpy: agent.listing.floorPrice,
  });
}
