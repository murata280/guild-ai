// GUILD AI — Proof of Make
// Converts a voice transcript (制作秘話) into structured proof-of-make data.
// UI never exposes "CCAF" — uses "制作の証明 / こだわり" instead.

export interface ProofOfMake {
  intentSignals: string[];
  thoughtDensitySummary: string;
  refinedDescription: string;
}

const KEYWORD_MAP: [string, string][] = [
  ["テスト",        "テスト駆動開発"],
  ["設計",          "設計レビュー済み"],
  ["ユーザー",      "ユーザーインタビュー反映"],
  ["ドキュメント",  "ドキュメント整備済み"],
  ["型",            "型定義あり"],
  ["レビュー",      "設計レビュー済み"],
  ["デバッグ",      "品質検証済み"],
  ["スペック",      "仕様書あり"],
  ["反復",          "反復改善済み"],
  ["ペア",          "ペアプロ実施"],
];

export function voiceLogToProofOfMake(transcript: string): ProofOfMake {
  const found = new Set<string>();
  for (const [kw, signal] of KEYWORD_MAP) {
    if (transcript.includes(kw)) found.add(signal);
  }

  const intentSignals = found.size > 0 ? [...found] : ["author-statement"];
  const density = Math.min(100, 30 + found.size * 15 + (transcript.length > 100 ? 20 : 0));

  return {
    intentSignals,
    thoughtDensitySummary:
      `${transcript.length}文字の制作秘話から ${found.size} 個の意思シグナルを検出。` +
      `推定思考密度: ${density}/100`,
    refinedDescription:
      transcript.slice(0, 200) +
      (transcript.length > 200 ? "…" : "") +
      "（制作の証明より自動生成）",
  };
}
