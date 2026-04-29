import { NextRequest, NextResponse } from "next/server";
import { verifySignedCommit, verifyHiddenFile } from "@/lib/ownership-verify";

export async function POST(req: NextRequest) {
  const isMock = req.headers.get("X-Mock-Verify") === "true";
  if (!isMock) return NextResponse.json({ error: "Not implemented" }, { status: 501 });

  const body = await req.json();
  const { repoUrl, method, payload } = body as {
    repoUrl: string;
    method: "commit" | "file";
    payload: unknown;
  };

  let result;
  if (method === "commit") {
    result = verifySignedCommit(repoUrl, payload as { message: string; verified: boolean });
  } else {
    result = verifyHiddenFile(repoUrl, payload as { path: string; contents: Record<string, unknown> });
  }

  return NextResponse.json(result);
}
