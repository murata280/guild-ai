# GUILD AI — Getting Started

> 知能資産の登記と信用の循環経済圏。詳細は `docs/idea.md` と `docs/マスター設計図.md` を参照。

## 保存先について
本プロジェクトは元々 `~/Desktop/GUILD_AI/` への配置を意図していましたが、
本セッション環境では macOS のフルディスクアクセス制限により Cowork ランタイムから
Desktop が読み書きできなかったため、代替として **`~/Documents/GUILD_AI/`** に配置しています。
Finder でフォルダごと Desktop に移動してもそのまま動作します（パスはすべて相対）。

## 構成

```
GUILD_AI/
├── README_START.md              # このファイル
├── package.json                 # Next.js + Vitest
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── next-env.d.ts
├── vitest.config.ts
├── docs/
│   ├── idea.md                  # コンセプト原典
│   ├── 用語集.md                 # 全資料の Single Source of Truth
│   ├── マスター設計図.md         # ビジネス × 技術の統合正典
│   ├── 戦略プレゼン.md           # Marp 形式（marp: true フロントマター付き）
│   ├── 業務フロー図.md           # Mermaid（flowchart / sequenceDiagram / stateDiagram）
│   └── 運用マニュアル.md         # 非エンジニア向け、脚注付き
└── src/
    ├── types/index.ts                          # 共通型 (CCAF, Listing, TrustScore...)
    ├── utils/format.ts                         # JPY フォーマット / GitHub URL バリデート
    ├── lib/
    │   ├── ai-auditor/
    │   │   ├── index.ts                        # 知能鑑定士 (S/A/B 判定 + Floor Price 算出)
    │   │   └── __tests__/audit.test.ts         # Vitest 単体テスト
    │   ├── trust-score/
    │   │   ├── index.ts                        # Trust Score 計算 (0-1000)
    │   │   └── __tests__/trust-score.test.ts   # Vitest 単体テスト
    │   └── discord-bridge/
    │       ├── index.ts                        # Discord イベント取り込み (重み・日次キャップ)
    │       └── __tests__/bridge.test.ts        # Vitest 単体テスト
    ├── components/trust-score/TrustScore.tsx   # 動的 Trust Score 表示
    └── app/
        ├── layout.tsx
        ├── globals.css
        ├── page.tsx                            # トップページ
        └── sell/page.tsx                       # 登記 UI (listing_008 継承)
```

## セットアップ

```bash
cd ~/Documents/GUILD_AI   # ※ Desktop に移動した場合はそちらを cd
npm install
npm run dev               # http://localhost:3000
```

その他のコマンド:

| コマンド | 用途 |
|---|---|
| `npm run build` | プロダクションビルド |
| `npm run typecheck` | 型整合性チェック (`tsc --noEmit`) |
| `npm test` | Vitest 単体テスト |

## 自己ループ監査ステータス

本セッションでは **Cowork のサンドボックス（Linux ワークスペース）が起動できず**、
`npm install` / `npm run build` / `npm test` を実機実行できませんでした。
代わりに以下を実施済みです:

- 全ファイルの **構文・型構造を手動レビュー** （`@/*` 解決 / TypeScript strict 互換）
- **用語集との突き合わせ** で CCAF・Trust Score・Proof of Thought・Ambassador・Floor Price の表記を全資料で統一
- ai-auditor / discord-bridge には境界値テストを設置済み（`npm test` でローカル実行可能）

ローカル環境で `npm install && npm run typecheck && npm test` を実行することで動作確認できます。

## 主要 API

```ts
import { audit, computeFloorPrice } from "@/lib/ai-auditor";
import { computeTrustScore } from "@/lib/trust-score";
import { discordBridge } from "@/lib/discord-bridge";

const result = audit({
  ccaf: { intentSignals: ["author-statement"], thoughtDensity: 85, iterations: 12, authorId: "u1", createdAt: new Date().toISOString() },
  vercelUptimeDays: 45
}); // → { rank: "S", score, reasons: ["魂の登記: ..."] }

const trust = computeTrustScore({ qualityHistory: 78, discordContribution: 64, xAmplification: 52 });
const floor = computeFloorPrice(5000, trust.score);

discordBridge.onContributionUpdate((userId, contribution) => { /* update Trust Score */ });
discordBridge.ingest({ userId: "u1", kind: "share", listingId: "l1", occurredAt: new Date().toISOString() });
```

## 設計の三大コンセプト
- **Proof of Thought** — CCAF をベースにプロセスを資産化
- **Ambassador Meritocracy** — Discord 拡散貢献の収益化
- **Trust-Based Pricing** — 信用に基づく Floor Price 担保

> 知能は労働ではなく登記される。信用は減衰せず循環する。
