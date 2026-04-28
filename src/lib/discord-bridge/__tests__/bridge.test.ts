import { describe, it, expect, beforeEach } from "vitest";
import { DiscordBridge, DISCORD_WEIGHTS, DAILY_CAP } from "../index";

describe("DiscordBridge", () => {
  let bridge: DiscordBridge;

  beforeEach(() => {
    bridge = new DiscordBridge();
  });

  it("awards weighted points per action kind", () => {
    expect(
      bridge.ingest({
        userId: "u1",
        kind: "share",
        listingId: "l1",
        occurredAt: "2026-04-01T10:00:00Z"
      })
    ).toBe(DISCORD_WEIGHTS.share);
    expect(bridge.contributionFor("u1")).toBe(DISCORD_WEIGHTS.share);
  });

  it("enforces the 50pt daily cap per user", () => {
    let total = 0;
    // 11 shares = 55pt requested, only 50pt awarded
    for (let i = 0; i < 11; i++) {
      total += bridge.ingest({
        userId: "u2",
        kind: "share",
        listingId: "l1",
        occurredAt: `2026-04-01T10:0${i % 10}:00Z`
      });
    }
    expect(total).toBe(DAILY_CAP);
  });

  it("resets the daily counter on a new date", () => {
    for (let i = 0; i < 11; i++) {
      bridge.ingest({
        userId: "u3",
        kind: "share",
        listingId: "l1",
        occurredAt: "2026-04-01T10:00:00Z"
      });
    }
    const awarded = bridge.ingest({
      userId: "u3",
      kind: "share",
      listingId: "l1",
      occurredAt: "2026-04-02T10:00:00Z"
    });
    expect(awarded).toBe(DISCORD_WEIGHTS.share);
  });

  it("notifies listeners when contribution updates", () => {
    const events: Array<[string, number]> = [];
    bridge.onContributionUpdate((u, c) => events.push([u, c]));
    bridge.ingest({
      userId: "u4",
      kind: "endorse",
      listingId: "l1",
      occurredAt: "2026-04-01T10:00:00Z"
    });
    expect(events).toEqual([["u4", DISCORD_WEIGHTS.endorse]]);
  });

  it("clamps cumulative contribution at 100", () => {
    const days = 30;
    for (let d = 0; d < days; d++) {
      const date = `2026-04-${String(d + 1).padStart(2, "0")}T10:00:00Z`;
      for (let i = 0; i < 11; i++) {
        bridge.ingest({
          userId: "u5",
          kind: "share",
          listingId: "l1",
          occurredAt: date
        });
      }
    }
    expect(bridge.contributionFor("u5")).toBe(100);
  });
});
