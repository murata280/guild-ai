// GUILD AI — discord-bridge
// Receives Discord events, applies weights and a per-day rate limit,
// then publishes updated discordContribution back to Trust Score.
// Spec: docs/マスター設計図.md §5 + docs/用語集.md.

import type { DiscordActionKind, DiscordEvent } from "@/types";

export const DISCORD_WEIGHTS: Record<DiscordActionKind, number> = {
  share: 5,
  endorse: 3,
  react: 1,
  "bug-report": 4
};

export const DAILY_CAP = 50; // pt per user per day

interface UserDailyState {
  date: string; // YYYY-MM-DD
  earned: number;
}

const dayKey = (iso: string) => iso.slice(0, 10);

export class DiscordBridge {
  private state = new Map<string, UserDailyState>();
  private contribution = new Map<string, number>(); // userId -> 0..100
  private listeners: Array<(userId: string, contribution: number) => void> = [];

  /**
   * Subscribe to discordContribution updates (Pub/Sub style).
   */
  onContributionUpdate(listener: (userId: string, contribution: number) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Ingest a Discord event. Returns the points actually awarded after rate-limiting.
   */
  ingest(event: DiscordEvent): number {
    const weight = DISCORD_WEIGHTS[event.kind];
    if (typeof weight !== "number") return 0;

    const today = dayKey(event.occurredAt);
    const prev = this.state.get(event.userId);
    const earnedToday = prev && prev.date === today ? prev.earned : 0;
    const remaining = Math.max(0, DAILY_CAP - earnedToday);
    const awarded = Math.min(weight, remaining);

    if (awarded > 0) {
      this.state.set(event.userId, { date: today, earned: earnedToday + awarded });
      const next = Math.min(100, (this.contribution.get(event.userId) ?? 0) + awarded);
      this.contribution.set(event.userId, next);
      for (const l of this.listeners) l(event.userId, next);
    }
    return awarded;
  }

  contributionFor(userId: string): number {
    return this.contribution.get(userId) ?? 0;
  }

  /** Test/debug helper: reset all internal state. */
  reset() {
    this.state.clear();
    this.contribution.clear();
    this.listeners = [];
  }
}

// Default singleton for app usage
export const discordBridge = new DiscordBridge();

// ─── Ambassador Meritocracy ───────────────────────────────────────────────────

export interface AmbassadorRewardResult {
  ambassadorId: string;
  saleAmount: number;
  rewardAmount: number;
  share: number;
  awardedAt: string;
}

/**
 * Calculate and record the ambassador referral reward for a completed sale.
 * Default share is 5% of the sale amount.
 */
export function attributeAmbassadorReward(
  ambassadorId: string,
  saleAmount: number,
  share = 0.05,
): AmbassadorRewardResult {
  const rewardAmount = Math.round(saleAmount * share);

  // Push contribution points to the bridge proportional to reward
  const contributionPoints = Math.min(10, Math.round(rewardAmount / 100));
  if (contributionPoints > 0) {
    discordBridge.ingest({
      userId: ambassadorId,
      kind: "share",
      listingId: `ambassador_sale_${ambassadorId}`,
      occurredAt: new Date().toISOString(),
    });
  }

  return {
    ambassadorId,
    saleAmount,
    rewardAmount,
    share,
    awardedAt: new Date().toISOString(),
  };
}
