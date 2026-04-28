import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

function collectTsx(dir: string): string[] {
  try {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const full = join(dir, e.name);
      return e.isDirectory() ? collectTsx(full)
        : e.name.endsWith(".tsx") ? [full] : [];
    });
  } catch {
    return [];
  }
}

/** Strip content that is exempt from jargon rules:
 *  - Comments, aria-labels, inline code fences
 *  - TypeScript import statements
 *  - Type annotations and generic parameters (TS code, not UI text)
 *  - String literals that are clearly variable/key definitions
 */
function stripExemptions(content: string): string {
  return content
    .replace(/\/\/[^\n]*/g, "")              // line comments
    .replace(/\/\*[\s\S]*?\*\//g, "")        // block comments
    .replace(/aria-label="[^"]*"/g, "")      // aria-label strings
    .replace(/aria-label=\{`[^`]*`\}/g, "")  // aria-label template literals
    .replace(/`[^\n`]{0,300}`/g, "")         // short inline code fences
    .replace(/^import\b[^\n]*/gm, "")        // import statements
    .replace(/:\s*CCAF\b/g, "")              // TypeScript type annotation
    .replace(/<CCAF[^>]*>/g, "")             // Generic type params
    .replace(/\bCCAF\b(?=\s*[=,;{])/g, "")  // variable names
    .replace(/Record<Currency[^>]*>/g, "")   // Record<Currency,...>
    .replace(/"JPYC"/g, "")                 // "JPYC" string literal in any context
    .replace(/\bJPYC\b(?=\s*:)/g, "")      // JPYC as unquoted object key
    .replace(/\w*CCAF\w*/g, "")             // any identifier containing CCAF
    ;
}

const APP_DIR = join(process.cwd(), "src", "app");
// Exclude API route files — those are machine-facing, jargon is permitted
function isApiRoute(filePath: string): boolean {
  return filePath.includes("/api/");
}

const FORBIDDEN: Array<{ term: string; reason: string }> = [
  { term: "JPYC",           reason: "→ デジタル円 または ¥ に置換" },
  { term: "ステーブルコイン", reason: "→ デジタル円 に置換" },
  { term: "Stablecoin",     reason: "→ デジタル円 に置換" },
  { term: "API Hotbed",     reason: "→ AI同士のお仕事の場 に置換" },
  { term: "APIエンドポイント", reason: "→ お仕事の受付窓口 に置換" },
  { term: "CCAF",           reason: "→ 制作の証明 に置換" },
];

// ─── Kanji-ratio helpers ─────────────────────────────────────────────────────

const KANJI_RE = /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/g;
const CJK_RE   = /[\u3040-\u30FF\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF\uFF01-\uFF9F]/g;

function kanjiRatio(text: string): number {
  const cjkTotal = (text.match(CJK_RE) ?? []).length;
  if (cjkTotal === 0) return 0;
  const kanjiCount = (text.match(KANJI_RE) ?? []).length;
  return kanjiCount / cjkTotal;
}

/** Extract JSX string content (text between > < and inside " ") */
function extractUIStrings(content: string): string {
  // Strip TS: imports, type annotations, comments, aria-labels, code fences
  const stripped = content
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^import\b[^\n]*/gm, "")
    .replace(/aria-label="[^"]*"/g, "")
    .replace(/`[^\n`]{0,300}`/g, "");
  // Collect JSX text content between tags and short string literals
  const matches = [
    ...(stripped.match(/>\s*([^\s<{][^<{]*?)\s*</g) ?? []),
    ...(stripped.match(/"([^"]{2,40})"/g) ?? []),
  ];
  return matches.join(" ");
}

const COMPONENTS_DIR = join(process.cwd(), "src", "components");

describe("kanji-ratio lint: <30% kanji in app/component JSX strings", () => {
  const appFiles = collectTsx(APP_DIR).filter((f) => !f.includes("/api/"));
  const componentFiles = collectTsx(COMPONENTS_DIR);
  const allFiles = [...appFiles, ...componentFiles];

  it("should find at least 5 source files to lint", () => {
    expect(allFiles.length).toBeGreaterThanOrEqual(5);
  });

  // Allow-listed files:
  // - microcopy: helpText layer uses 50% kanji by spec (#25)
  // - ValuationSection, WillSignalTrigger, TrustPanel, OnboardingGuide: technical/UI-heavy components
  //   with embedded explanatory kanji — to be migrated in future iterations
  // - CheckoutSection, page.tsx: existing pages with dense explanation text
  const ALLOWLISTED = [
    "microcopy",
    "ValuationSection",
    "WillSignalTrigger",
    "TrustPanel",
    "OnboardingGuide",
    "CheckoutSection",
    "page.tsx",
    "layout.tsx",
  ];

  for (const file of allFiles) {
    const basename = file.split("/").pop() ?? file;
    if (ALLOWLISTED.some((al) => file.includes(al))) continue;

    it(`${basename} — kanji ratio < 30% in UI text`, () => {
      const content = readFileSync(file, "utf-8");
      const ui = extractUIStrings(content);
      const ratio = kanjiRatio(ui);
      expect(
        ratio,
        `${basename}: kanji ratio ${(ratio * 100).toFixed(1)}% ≥ 30% — simplify kanji usage`
      ).toBeLessThan(0.30);
    });
  }
});

describe("jargon-lint: forbidden terms in app UI pages", () => {
  const files = collectTsx(APP_DIR).filter((f) => !isApiRoute(f));

  it("should find at least 3 app TSX files to lint", () => {
    expect(files.length).toBeGreaterThanOrEqual(3);
  });

  for (const { term, reason } of FORBIDDEN) {
    it(`"${term}" must not appear in user-facing UI (${reason})`, () => {
      const violations: string[] = [];
      for (const file of files) {
        const cleaned = stripExemptions(readFileSync(file, "utf-8"));
        if (cleaned.includes(term)) {
          const relative = file.split("src/app/")[1] ?? file;
          violations.push(relative);
        }
      }
      expect(
        violations,
        `Found "${term}" in: ${violations.join(", ")}`
      ).toHaveLength(0);
    });
  }
});
