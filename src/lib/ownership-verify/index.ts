function randomHex(n: number): string {
  // Deterministic "random" using current timestamp truncated — mock only
  return Array.from({ length: n }, (_, i) => ((Date.now() >> i) & 0xf).toString(16)).join("");
}

export interface CommitChallenge {
  token: string;
  expectedCommitMessage: string;
  repoUrl: string;
  claimerHandle: string;
}

export interface HiddenFileChallenge {
  token: string;
  expectedFilePath: string;
  expectedContents: { token: string; claimerHandle: string; timestamp: number };
  repoUrl: string;
}

export type VerifyResult =
  | { success: true; claimStatus: "claimed" }
  | { success: false; reason: "token_mismatch" | "not_verified" | "file_not_found" | "content_mismatch" };

const challengeStore = new Map<string, CommitChallenge | HiddenFileChallenge>();

export function requestSignedCommit(repoUrl: string, claimerHandle: string): CommitChallenge {
  const token = randomHex(32);
  const challenge: CommitChallenge = {
    token,
    expectedCommitMessage: `GUILD-CLAIM:${token}`,
    repoUrl,
    claimerHandle,
  };
  challengeStore.set(`commit:${repoUrl}`, challenge);
  return challenge;
}

export function verifySignedCommit(
  repoUrl: string,
  latestCommit: { message: string; verified: boolean }
): VerifyResult {
  const challenge = challengeStore.get(`commit:${repoUrl}`) as CommitChallenge | undefined;
  if (!challenge) return { success: false, reason: "token_mismatch" };
  if (!latestCommit.message.includes(challenge.token)) return { success: false, reason: "token_mismatch" };
  if (!latestCommit.verified) return { success: false, reason: "not_verified" };
  return { success: true, claimStatus: "claimed" };
}

export function requestHiddenFile(repoUrl: string, claimerHandle: string): HiddenFileChallenge {
  const token = randomHex(32);
  const challenge: HiddenFileChallenge = {
    token,
    expectedFilePath: ".guild/claim.json",
    expectedContents: { token, claimerHandle, timestamp: Date.now() },
    repoUrl,
  };
  challengeStore.set(`file:${repoUrl}`, challenge);
  return challenge;
}

export function verifyHiddenFile(
  repoUrl: string,
  file: { path: string; contents: Record<string, unknown> }
): VerifyResult {
  const challenge = challengeStore.get(`file:${repoUrl}`) as HiddenFileChallenge | undefined;
  if (!challenge) return { success: false, reason: "file_not_found" };
  if (file.path !== challenge.expectedFilePath) return { success: false, reason: "file_not_found" };
  if (file.contents.token !== challenge.token) return { success: false, reason: "content_mismatch" };
  return { success: true, claimStatus: "claimed" };
}
