import { describe, it, expect } from "vitest";
import {
  requestSignedCommit,
  verifySignedCommit,
  requestHiddenFile,
  verifyHiddenFile,
} from "@/lib/ownership-verify";

const REPO_URL = "https://github.com/test/ownership-verify-test";
const REPO_URL_2 = "https://github.com/test/ownership-verify-test-2";

describe("ownership-verify", () => {
  describe("requestSignedCommit", () => {
    it("returns challenge with token and expectedCommitMessage", () => {
      const challenge = requestSignedCommit(REPO_URL, "testuser");
      expect(typeof challenge.token).toBe("string");
      expect(challenge.token.length).toBeGreaterThan(0);
      expect(challenge.expectedCommitMessage).toContain("GUILD-CLAIM:");
      expect(challenge.expectedCommitMessage).toContain(challenge.token);
    });

    it("sets claimerHandle and repoUrl", () => {
      const challenge = requestSignedCommit(REPO_URL, "testuser");
      expect(challenge.claimerHandle).toBe("testuser");
      expect(challenge.repoUrl).toBe(REPO_URL);
    });
  });

  describe("verifySignedCommit", () => {
    it("succeeds with matching token and verified=true", () => {
      const challenge = requestSignedCommit(REPO_URL, "testuser");
      const result = verifySignedCommit(REPO_URL, {
        message: `GUILD-CLAIM:${challenge.token}`,
        verified: true,
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.claimStatus).toBe("claimed");
    });

    it("fails with wrong token", () => {
      requestSignedCommit(REPO_URL, "testuser");
      const result = verifySignedCommit(REPO_URL, {
        message: "GUILD-CLAIM:wrong-token-xyz",
        verified: true,
      });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.reason).toBe("token_mismatch");
    });

    it("fails with verified=false even with correct token", () => {
      const challenge = requestSignedCommit(REPO_URL, "testuser");
      const result = verifySignedCommit(REPO_URL, {
        message: `GUILD-CLAIM:${challenge.token}`,
        verified: false,
      });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.reason).toBe("not_verified");
    });
  });

  describe("requestHiddenFile", () => {
    it("returns challenge with .guild/claim.json path", () => {
      const challenge = requestHiddenFile(REPO_URL_2, "testuser2");
      expect(challenge.expectedFilePath).toBe(".guild/claim.json");
      expect(typeof challenge.token).toBe("string");
      expect(challenge.expectedContents.token).toBe(challenge.token);
    });
  });

  describe("verifyHiddenFile", () => {
    it("succeeds with correct token in correct path", () => {
      const challenge = requestHiddenFile(REPO_URL_2, "testuser2");
      const result = verifyHiddenFile(REPO_URL_2, {
        path: ".guild/claim.json",
        contents: { token: challenge.token, claimerHandle: "testuser2" },
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.claimStatus).toBe("claimed");
    });

    it("fails with wrong path", () => {
      const challenge = requestHiddenFile(REPO_URL_2, "testuser2");
      const result = verifyHiddenFile(REPO_URL_2, {
        path: ".wrong/path.json",
        contents: { token: challenge.token },
      });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.reason).toBe("file_not_found");
    });

    it("fails with wrong token in correct path", () => {
      requestHiddenFile(REPO_URL_2, "testuser2");
      const result = verifyHiddenFile(REPO_URL_2, {
        path: ".guild/claim.json",
        contents: { token: "wrong-token-xyz" },
      });
      expect(result.success).toBe(false);
      if (!result.success) expect(result.reason).toBe("content_mismatch");
    });
  });
});
