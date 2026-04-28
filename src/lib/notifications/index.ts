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
