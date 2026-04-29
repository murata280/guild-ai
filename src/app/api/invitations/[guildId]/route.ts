import { NextRequest, NextResponse } from "next/server";
import { crawlPublicSources } from "@/lib/crawler";
import { generateDraftCCAF } from "@/lib/draft-listing";
import { generateInvitation } from "@/lib/discovery";
import { mintGuildId } from "@/lib/guild-id";

export async function GET(
  _req: NextRequest,
  { params }: { params: { guildId: string } }
) {
  const repos = crawlPublicSources();
  const repo = repos[0]; // Mock: return first for any guildId lookup
  const draft = generateDraftCCAF(repo);
  const guildId = mintGuildId(repo.source, repo.repoUrl, repo.lastCommitSha);
  const invitation = generateInvitation(repo, guildId, draft.valuePool);
  return NextResponse.json({ guildId: params.guildId, invitation });
}
