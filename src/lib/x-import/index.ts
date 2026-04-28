// GUILD AI — X-Social Import
// Extracts listing draft data from an X (twitter.com / x.com) post URL.
// All results are deterministic mocks — no real API calls.

export interface XImportResult {
  summary: string;
  hashtags: string[];
  suggestedTitle: string;
  suggestedDescription: string;
}

const X_URL_RE = /^https?:\/\/(x\.com|twitter\.com)\/.+\/status\/\d+/;

const TOPICS = [
  "AI開発",
  "機械学習",
  "LLM活用",
  "TypeScript",
  "アーキテクチャ設計",
  "データエンジニアリング",
];

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function extractFromPostUrl(url: string): XImportResult {
  if (!X_URL_RE.test(url)) {
    return {
      summary: "",
      hashtags: [],
      suggestedTitle: "未検出",
      suggestedDescription: "有効な X (x.com / twitter.com) ポスト URL を入力してください。",
    };
  }

  const h = djb2(url);
  const topic = TOPICS[h % TOPICS.length];
  const topic2 = TOPICS[(h + 2) % TOPICS.length];

  return {
    summary: `${topic} に関する実装知見を共有したポスト。具体的な手法と考察が含まれる。`,
    hashtags: [
      `#${topic.replace(/\s/g, "")}`,
      `#${topic2.replace(/\s/g, "")}`,
      "#知能資産",
    ],
    suggestedTitle: `${topic} の実装知見 — 知能資産`,
    suggestedDescription:
      `X ポストから抽出: ${topic} に関する実装知見と考察を AI が登記用に構造化。` +
      `${topic2} との接続点も整理済み。`,
  };
}
