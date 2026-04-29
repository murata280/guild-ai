// GUILD AI — Skill-to-Asset Sync
// Connects GitHub contribution grass and learning progress to rank boost.
// Spec: docs/Skill-to-Asset設計.md

import type { Rank } from "@/types";

// ─── Deterministic hash ────────────────────────────────────────────────────────

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ─── GitHub green score ────────────────────────────────────────────────────────

/**
 * Returns a mock GitHub contribution activity score for the past 90 days.
 * Range: 0–100. Deterministic per username.
 */
export function getGithubGreenScore(username: string): number {
  const base = djb2(username + "_green") % 101;
  return base;
}

// ─── Learning progress ─────────────────────────────────────────────────────────

/**
 * Returns the number of completed learning modules for a user.
 * Range: 0–20. Deterministic per userId.
 */
export function getLearningProgress(userId: string): number {
  return djb2(userId + "_learning") % 21;
}

// ─── Rank boost ───────────────────────────────────────────────────────────────

const RANK_ORDER: Rank[] = ["B", "A", "S"];

function rankIndex(r: Rank): number {
  return RANK_ORDER.indexOf(r);
}

function rankAt(idx: number): Rank {
  return RANK_ORDER[Math.min(idx, RANK_ORDER.length - 1)];
}

/**
 * Apply a skill-based rank boost:
 * - greenScore ≥ 70 AND learningProgress ≥ 10 → +1 rank
 * - greenScore ≥ 85 AND learningProgress ≥ 17 → +2 ranks (capped at S)
 */
export function applySkillBoost(
  currentRank: Rank,
  greenScore: number,
  learningProgress: number,
): Rank {
  const baseIdx = rankIndex(currentRank);

  if (greenScore >= 85 && learningProgress >= 17) {
    return rankAt(baseIdx + 2);
  }
  if (greenScore >= 70 && learningProgress >= 10) {
    return rankAt(baseIdx + 1);
  }
  return currentRank;
}

// ─── Progress-to-next-boost ───────────────────────────────────────────────────

export interface SkillBoostHint {
  boostedRank: Rank;
  greenScore: number;
  learningProgress: number;
  nextBoostPct: number; // 0-100 progress toward the next tier
  hintMessage: string;  // 執事トーン
}

export function getSkillBoostHint(username: string, userId: string, currentRank: Rank): SkillBoostHint {
  const greenScore = getGithubGreenScore(username);
  const learningProgress = getLearningProgress(userId);
  const boostedRank = applySkillBoost(currentRank, greenScore, learningProgress);

  // Progress toward +1 tier threshold (70/10)
  const greenPct = Math.min(100, (greenScore / 70) * 100);
  const learnPct = Math.min(100, (learningProgress / 10) * 100);
  const nextBoostPct = Math.round((greenPct + learnPct) / 2);

  let hintMessage: string;
  if (boostedRank === "S") {
    hintMessage = "最高ランクに達しています。素晴らしい活動をお続けください。";
  } else if (nextBoostPct >= 80) {
    hintMessage = `もう少しでランクが上がります（あと${100 - nextBoostPct}%）。GitHubへの継続的なコミットをお勧めします。`;
  } else {
    hintMessage = `GitHubの活動と学習を続けることで、ランクアップが見込まれます（現在${nextBoostPct}%）。`;
  }

  return { boostedRank, greenScore, learningProgress, nextBoostPct, hintMessage };
}
