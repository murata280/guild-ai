import { describe, it, expect } from "vitest";
import {
  mintGuildId,
  mintGuildIdForAsset,
  parseGuildUri,
  toGuildUri,
  toAgentEndpoint,
  toAssetUrl,
} from "@/lib/guild-id";

describe("guild-id", () => {
  describe("mintGuildId", () => {
    it("returns string matching GUILD:XXXX-XXXX-XXXX pattern", () => {
      const id = mintGuildId("github", "https://github.com/example/repo", "abc123");
      expect(id).toMatch(/^GUILD:[0-9]+-[0-9A-F]+-[0-9A-F]+$/);
    });

    it("is deterministic — same inputs produce same output", () => {
      const id1 = mintGuildId("github", "https://github.com/example/repo", "abc123");
      const id2 = mintGuildId("github", "https://github.com/example/repo", "abc123");
      expect(id1).toBe(id2);
    });

    it("different inputs produce different IDs", () => {
      const id1 = mintGuildId("github", "https://github.com/a/repo1", "sha1");
      const id2 = mintGuildId("github", "https://github.com/b/repo2", "sha2");
      expect(id1).not.toBe(id2);
    });
  });

  describe("mintGuildIdForAsset", () => {
    it("returns GUILD: prefixed ID", () => {
      const id = mintGuildIdForAsset("asset-001");
      expect(id.startsWith("GUILD:")).toBe(true);
    });

    it("is deterministic", () => {
      expect(mintGuildIdForAsset("asset-001")).toBe(mintGuildIdForAsset("asset-001"));
    });
  });

  describe("parseGuildUri", () => {
    it("parses guild:// format", () => {
      const result = parseGuildUri("guild://1234-ABCD-EF01");
      expect(result).not.toBeNull();
      expect(result!.format).toBe("guild-uri");
      expect(result!.guildId).toBe("GUILD:1234-ABCD-EF01");
    });

    it("parses https://guild-ai.vercel.app/asset/... format", () => {
      const result = parseGuildUri("https://guild-ai.vercel.app/asset/GUILD:5678-BEEF-CAFE");
      expect(result).not.toBeNull();
      expect(result!.format).toBe("https-url");
      expect(result!.guildId).toContain("GUILD:");
    });

    it("returns null for unrecognized format", () => {
      expect(parseGuildUri("https://example.com")).toBeNull();
      expect(parseGuildUri("random-string")).toBeNull();
    });
  });

  describe("toAgentEndpoint", () => {
    it("returns correct /api/atoa/by-guild/ path", () => {
      const ep = toAgentEndpoint("GUILD:1234-ABCD-EF01");
      expect(ep).toBe("/api/atoa/by-guild/1234-ABCD-EF01");
    });
  });

  describe("toGuildUri", () => {
    it("converts GUILD: ID to guild:// URI", () => {
      expect(toGuildUri("GUILD:1234-ABCD-EF01")).toBe("guild://1234-ABCD-EF01");
    });
  });

  describe("toAssetUrl", () => {
    it("constructs full asset URL", () => {
      const url = toAssetUrl("GUILD:1234-ABCD-EF01");
      expect(url).toBe("https://guild-ai.vercel.app/asset/GUILD:1234-ABCD-EF01");
    });
  });
});
