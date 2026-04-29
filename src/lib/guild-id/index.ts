function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function toHex4(n: number): string {
  return (n & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

export function mintGuildId(source: string, repoUrl: string, lastCommitSha: string): string {
  const combined = `${source}:${repoUrl}:${lastCommitSha}`;
  const seed = djb2(combined);
  const part1 = String(seed % 10000).padStart(4, "0");
  const part2 = toHex4(seed >> 4);
  const part3 = toHex4(seed >> 8);
  return `GUILD:${part1}-${part2}-${part3}`;
}

export function mintGuildIdForAsset(assetId: string): string {
  const seed = djb2(assetId);
  const part1 = String(seed % 10000).padStart(4, "0");
  const part2 = toHex4(seed >> 4);
  const part3 = toHex4(seed >> 8);
  return `GUILD:${part1}-${part2}-${part3}`;
}

const BASE_URL = "https://guild-ai.vercel.app";

export interface ParsedGuildUri {
  guildId: string;
  format: "guild-uri" | "https-url";
}

export function parseGuildUri(uri: string): ParsedGuildUri | null {
  // guild://XXXX-XXXX-XXXX format
  const guildMatch = uri.match(/^guild:\/\/([0-9A-Z]+-[0-9A-F]+-[0-9A-F]+)$/i);
  if (guildMatch) return { guildId: `GUILD:${guildMatch[1].toUpperCase()}`, format: "guild-uri" };

  // https://guild-ai.vercel.app/asset/GUILD:XXXX-XXXX-XXXX
  const httpsMatch = uri.match(/guild-ai\.vercel\.app\/asset\/(GUILD:[0-9A-Z]+-[0-9A-F]+-[0-9A-F]+)/i);
  if (httpsMatch) return { guildId: httpsMatch[1].toUpperCase(), format: "https-url" };

  return null;
}

export function toGuildUri(guildId: string): string {
  const raw = guildId.replace("GUILD:", "");
  return `guild://${raw}`;
}

export function toAgentEndpoint(guildId: string): string {
  const raw = guildId.replace("GUILD:", "");
  return `/api/atoa/by-guild/${raw}`;
}

export function toAssetUrl(guildId: string): string {
  return `${BASE_URL}/asset/${guildId}`;
}
