// GUILD AI — Income Push Notifications
// Deterministic mock notifications for the bell UI.
// Real implementation would subscribe to webhook events from atoa-runner.

import type { IncomeNotification, NotificationType } from "@/types";

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const NOTIFICATION_TEMPLATES: Array<{
  type: NotificationType;
  title: string;
  makeMessage: (amount: number) => string;
}> = [
  {
    type: "job_income",
    title: "お仕事の入金",
    makeMessage: (a) => `AIエージェントがお仕事を完了しました。¥${a.toLocaleString()} が入金されました。`,
  },
  {
    type: "royalty",
    title: "ロイヤリティ受領",
    makeMessage: (a) => `あなたの知能資産が再利用されました。ロイヤリティ ¥${a.toLocaleString()} を受け取りました。`,
  },
  {
    type: "rank_up",
    title: "ランクアップ！",
    makeMessage: (a) => `信用スコアが ${a} に到達し、ランクが上がりました。`,
  },
  {
    type: "job_income",
    title: "AtoA お仕事完了",
    makeMessage: (a) => `エージェント間の取引が完了。¥${a.toLocaleString()} が自動入金されました。`,
  },
  {
    type: "refund",
    title: "返金処理",
    makeMessage: (a) => `健全性チェックにより ¥${a.toLocaleString()} が自動返金されました。`,
  },
];

const AMOUNTS = [500, 800, 1200, 2000, 3500, 150, 75];

export function getNotifications(userId: string): IncomeNotification[] {
  const seed = djb2(userId + "_notifications");
  const count = 5;

  return Array.from({ length: count }, (_, i) => {
    const s = djb2(`${userId}_notif_${i}`);
    const template = NOTIFICATION_TEMPLATES[s % NOTIFICATION_TEMPLATES.length];
    const amount = AMOUNTS[(s + i) % AMOUNTS.length];
    const minsAgo = (s % 60) + i * 15;
    const createdAt = new Date(Date.now() - minsAgo * 60 * 1000).toISOString();
    return {
      id: `notif_${seed}_${i}`,
      type: template.type,
      title: template.title,
      message: template.makeMessage(amount),
      amount,
      read: i > 1, // first 2 are always unread
      createdAt,
    };
  });
}

export function getUnreadCount(userId: string): number {
  return getNotifications(userId).filter((n) => !n.read).length;
}

// ─── Ambassador reward notifications ─────────────────────────────────────────

export interface AmbassadorNotification extends Omit<IncomeNotification, "type"> {
  type: "ambassador";
  txHash: string;
  referredAssetId: string;
}

const MOCK_AMBASSADOR_NOTIFICATIONS: AmbassadorNotification[] = [
  {
    id: "notif_amb_001",
    type: "ambassador",
    title: "アンバサダー報酬を受け取りました",
    message: "あなたのシェアから購入が発生しました。¥500 を分配しました（tx: 0x1a2b3c4d...）",
    amount: 500,
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    txHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
    referredAssetId: "asset-001",
  },
  {
    id: "notif_amb_002",
    type: "ambassador",
    title: "アンバサダー報酬を受け取りました",
    message: "シェアが売上に繋がりました。¥250 を分配しました（tx: 0x9f8e7d6c...）",
    amount: 250,
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    txHash: "0x9f8e7d6c5b4a3210fedcba9876543210fedcba9876543210fedcba9876543210",
    referredAssetId: "asset-002",
  },
];

export function getAmbassadorNotifications(_userId: string): AmbassadorNotification[] {
  return MOCK_AMBASSADOR_NOTIFICATIONS;
}

export function getAllNotifications(userId: string): IncomeNotification[] {
  return [...getAmbassadorNotifications(userId), ...getNotifications(userId)];
}
