// GUILD AI — Listing Generator

export interface SalesParts {
  sellingPoints: string[];
  productManual: string[];
  priceSuggestion: number;
}

const SELLING_POINT_PATTERNS: { pattern: RegExp; point: string }[] = [
  { pattern: /api|endpoint/i, point: "APIとして即利用可能" },
  { pattern: /react|next\.js|nextjs/i, point: "モダンフロントエンド対応" },
  { pattern: /typescript/i, point: "型安全・保守性が高い" },
  { pattern: /ai|gpt|openai|langchain/i, point: "AI機能を内蔵" },
  { pattern: /docker|container/i, point: "コンテナで環境構築ゼロ" },
  { pattern: /test|spec|jest|vitest/i, point: "テスト済みで品質保証" },
  { pattern: /ci\/cd|github actions|vercel/i, point: "デプロイ自動化対応" },
  { pattern: /readme|document/i, point: "ドキュメント完備" },
];

const MANUAL_TEMPLATES = [
  "リポジトリをフォークし、`.env`に必要なキーを設定する",
  "`npm install` で依存関係をインストールする",
  "コマンド一発でローカル起動・動作確認できる",
  "Vercelまたは任意のサーバーにデプロイして公開URLを取得する",
  "APIキーを受け取った利用者は即日利用開始できる",
];

export function extractSalesParts(readmeText: string): SalesParts {
  const sellingPoints = SELLING_POINT_PATTERNS
    .filter(({ pattern }) => pattern.test(readmeText))
    .map(({ point }) => point)
    .slice(0, 4);

  if (sellingPoints.length === 0) sellingPoints.push("すぐに使える完成品");

  const techCount = sellingPoints.length;
  const priceSuggestion = 3000 + techCount * 1500;

  return { sellingPoints, productManual: MANUAL_TEMPLATES, priceSuggestion };
}

export function generateRemixDescription(originalTitle: string): string {
  return `「${originalTitle}」の機能を活用し、新しいユースケースに特化した知能資産。既存の API キーを継承しつつ、独自の拡張を加えて再登記。`;
}

export interface ReadmeExtract {
  title: string;
  description: string;
  techStack: string[];
  suggestedPrice: number;
}

const TECH_PATTERNS: { pattern: RegExp; name: string }[] = [
  { pattern: /typescript|\.tsx?/i, name: "TypeScript" },
  { pattern: /python|\.py/i, name: "Python" },
  { pattern: /next\.js|nextjs/i, name: "Next.js" },
  { pattern: /react/i, name: "React" },
  { pattern: /langchain/i, name: "LangChain" },
  { pattern: /openai|gpt/i, name: "OpenAI" },
  { pattern: /vercel/i, name: "Vercel" },
  { pattern: /rust/i, name: "Rust" },
  { pattern: /go\b|golang/i, name: "Go" },
  { pattern: /docker/i, name: "Docker" },
];

export function extractFromReadme(readmeText: string): ReadmeExtract {
  const lines = readmeText.split("\n");

  // Extract title from first # heading
  const titleLine = lines.find((l) => l.startsWith("# "));
  const title = titleLine ? titleLine.replace(/^#\s+/, "").trim() : "知能資産";

  // Extract description from first non-empty paragraph after title
  const descLines: string[] = [];
  let pastTitle = !titleLine;
  for (const line of lines) {
    if (!pastTitle && line === titleLine) { pastTitle = true; continue; }
    if (!pastTitle) continue;
    if (line.startsWith("#")) break;
    if (line.trim().length > 10) descLines.push(line.trim());
    if (descLines.length >= 2) break;
  }
  const description = descLines.join(" ").slice(0, 200) || title;

  // Detect tech stack
  const techStack = TECH_PATTERNS
    .filter(({ pattern }) => pattern.test(readmeText))
    .map(({ name }) => name)
    .slice(0, 5);

  // Suggested price: 3000 base + 2000 per tech stack item
  const suggestedPrice = 3000 + techStack.length * 2000;

  return { title, description, techStack, suggestedPrice };
}
