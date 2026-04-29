// GUILD AI — Proof of Make
// Converts a voice transcript (制作秘話) into structured proof-of-make data.
// UI never exposes "CCAF" — uses "制作の証明 / こだわり" instead.

export interface ProofOfMake {
  intentSignals: string[];
  thoughtDensitySummary: string;
  refinedDescription: string;
}

export interface ProductPitch {
  description: string;
  manual: string[];
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

const PITCH_INTROS = [
  "独自の技術と深い専門知識を集結させた",
  "実際の業務で磨かれた",
  "ユーザーの課題を真摯に考え抜いた",
  "反復的な改善と検証を重ねた",
  "実践的な知見を結集した",
];

const MANUAL_ITEMS = [
  "アクセスキーを取得して即座にご利用いただけます。",
  "日本語・英語のどちらでも入力に対応しています。",
  "シンプルなインターフェースで、既存のシステムと容易に連携できます。",
  "エラー処理が充実しており、本番環境でも安心してご利用いただけます。",
  "定期的なアップデートにより、最新の精度と機能を常に提供いたします。",
  "詳細なマニュアルとサンプルをご用意しています。",
  "24時間365日稼働し、高い可用性を実現しています。",
];

function djb2(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function generateProductPitch(transcript: string): ProductPitch {
  const seed = djb2(transcript || "default");
  const intro = PITCH_INTROS[seed % PITCH_INTROS.length];
  const snippet = transcript.slice(0, 50).replace(/[。、！？\n]/g, "").trim() || "知能の詰まった資産";

  const description = `${intro}作品です。${snippet}を核とした高精度な知能をご提供いたします。安定した稼働実績と丁寧な設計により、ビジネス現場での即戦力となります。`.slice(0, 200);

  const manual = Array.from({ length: 5 }, (_, i) => MANUAL_ITEMS[(seed + i) % MANUAL_ITEMS.length]);

  return { description, manual };
}
