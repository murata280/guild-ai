import { describe, it, expect } from "vitest";
import { getNotifications, getUnreadCount, getAmbassadorNotifications, getAllNotifications } from "../index";

describe("getNotifications", () => {
  it("returns exactly 5 notifications", () => {
    const notifs = getNotifications("user-abc");
    expect(notifs).toHaveLength(5);
  });

  it("all notifications have required fields", () => {
    const notifs = getNotifications("user-test");
    for (const n of notifs) {
      expect(n.id).toMatch(/^notif_/);
      expect(["job_income", "royalty", "rank_up", "refund"]).toContain(n.type);
      expect(typeof n.title).toBe("string");
      expect(n.title.length).toBeGreaterThan(0);
      expect(typeof n.message).toBe("string");
      expect(typeof n.read).toBe("boolean");
      expect(typeof n.createdAt).toBe("string");
    }
  });

  it("is deterministic for same userId", () => {
    const a = getNotifications("alice");
    const b = getNotifications("alice");
    expect(a.map((n) => n.id)).toEqual(b.map((n) => n.id));
    expect(a.map((n) => n.type)).toEqual(b.map((n) => n.type));
  });

  it("first 2 notifications are unread", () => {
    const notifs = getNotifications("user-xyz");
    expect(notifs[0].read).toBe(false);
    expect(notifs[1].read).toBe(false);
    expect(notifs[2].read).toBe(true);
  });
});

describe("getAmbassadorNotifications (ambassador category filter)", () => {
  it("returns ambassador-typed notifications only", () => {
    const notifs = getAmbassadorNotifications("any-user");
    expect(notifs.length).toBeGreaterThan(0);
    for (const n of notifs) {
      expect(n.type).toBe("ambassador");
      expect(n.txHash).toMatch(/^0x[0-9a-f]{64}$/);
      expect(n.referredAssetId).toBeTruthy();
    }
  });

  it("getAllNotifications includes both regular and ambassador notifications", () => {
    const all = getAllNotifications("demo-user");
    const regular = getNotifications("demo-user");
    const ambassador = getAmbassadorNotifications("demo-user");
    expect(all.length).toBe(regular.length + ambassador.length);
  });
});

describe("getUnreadCount", () => {
  it("returns 2 for any user (first 2 are always unread)", () => {
    expect(getUnreadCount("user-a")).toBe(2);
    expect(getUnreadCount("user-b")).toBe(2);
  });

  it("is consistent with getNotifications unread count", () => {
    const userId = "user-consistency";
    const notifs = getNotifications(userId);
    const expectedUnread = notifs.filter((n) => !n.read).length;
    expect(getUnreadCount(userId)).toBe(expectedUnread);
  });
});
