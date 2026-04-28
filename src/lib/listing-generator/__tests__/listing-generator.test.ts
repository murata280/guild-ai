import { describe, it, expect } from "vitest";
import { extractFromReadme } from "../index";

const SAMPLE_README = `# demo/ai-agent
自律型 AI エージェントフレームワーク

このリポジトリは LangChain と OpenAI GPT-4 を使った自律型エージェントの実装です。TypeScript + Next.js で構築されており、Vercel に即座にデプロイできます。

## 技術スタック
- TypeScript / Next.js
- OpenAI API
- LangChain
- Vercel
`;

describe("extractFromReadme", () => {
  it("extracts the title from the first # heading", () => {
    const result = extractFromReadme(SAMPLE_README);
    expect(result.title).toBe("demo/ai-agent");
  });

  it("detects tech stack items from README content", () => {
    const result = extractFromReadme(SAMPLE_README);
    expect(result.techStack).toContain("TypeScript");
    expect(result.techStack).toContain("Next.js");
    expect(result.techStack).toContain("LangChain");
  });

  it("calculates suggestedPrice as 3000 + 2000 per tech stack item", () => {
    const result = extractFromReadme(SAMPLE_README);
    expect(result.suggestedPrice).toBe(3000 + result.techStack.length * 2000);
    expect(result.suggestedPrice).toBeGreaterThan(3000);
  });

  it("falls back to title when no description paragraph found", () => {
    const minimal = `# My Asset\n## Section\nsome content`;
    const result = extractFromReadme(minimal);
    expect(result.title).toBe("My Asset");
    expect(result.description.length).toBeGreaterThan(0);
  });

  it("caps tech stack at 5 items", () => {
    const result = extractFromReadme(SAMPLE_README);
    expect(result.techStack.length).toBeLessThanOrEqual(5);
  });
});
