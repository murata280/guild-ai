// GUILD AI — GitHub Picker (mock)
// Returns deterministic repo list seeded from username. No PAT required.

export interface MockRepo {
  id: string;
  name: string;
  fullName: string;
  description: string;
  url: string;
  language: string;
  stars: number;
}

const REPO_TEMPLATES: { name: string; desc: string }[] = [
  { name: "ai-agent",       desc: "自律型 AI エージェントフレームワーク" },
  { name: "llm-toolkit",    desc: "LLM 統合ツールキット" },
  { name: "data-pipeline",  desc: "高スループットデータパイプライン" },
  { name: "api-gateway",    desc: "マイクロサービス用 API ゲートウェイ" },
  { name: "smart-contract", desc: "Web3 スマートコントラクトライブラリ" },
  { name: "ml-runner",      desc: "分散機械学習ランナー" },
  { name: "embed-search",   desc: "ベクトル埋め込み検索エンジン" },
  { name: "code-gen",       desc: "AI コード生成モジュール" },
  { name: "chat-bot",       desc: "マルチモーダル会話エージェント" },
  { name: "vector-db",      desc: "インメモリベクトルデータベース" },
];

const LANGUAGES = ["TypeScript", "Python", "Go", "Rust", "JavaScript"];

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function listRepos(user: string): MockRepo[] {
  const seed = djb2(user || "demo");
  return REPO_TEMPLATES.map((t, i) => ({
    id: `repo-${seed}-${i}`,
    name: t.name,
    fullName: `${user || "demo"}/${t.name}`,
    description: t.desc,
    url: `https://github.com/${user || "demo"}/${t.name}`,
    language: LANGUAGES[(seed + i) % LANGUAGES.length],
    stars: ((seed * (i + 1)) % 500) + 10,
  }));
}
