// GUILD AI — Listing Generator

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
