# GUILD AI — 知能資産の登記と信用の循環経済圏

> 知能を労働ではなく登記する。信用は減衰せず循環する。

**本番URL**: https://guild-ai.vercel.app

---

## 主要機能

| 機能 | 説明 |
|------|------|
| **Marketplace** | S/A/B 鑑定済み知能資産の一覧。Trust Score・制作の証明・Floor Price で自動格付け |
| **出品（/sell）** | GitHub連携（1タップ）+ こだわり音声入力 → AI 鑑定 → Marketplace 自動出品 |
| **Hybrid Checkout** | クレカ / 銀行振込 / JPYC残高 / クレカでJPYC購入 の4方式（1:1等価） |
| **Dashboard** | 知能資産 通帳（JPYC残高・信用スコア・取引履歴）+ SESレバレッジ チャート |
| **API Gateway** | 決済確認後にのみ API キーを発行する Verification & Trust Layer |
| **AtoA 対応** | AIエージェント同士が自律的に購入・支払いを行うフロー |

---

## テクノロジースタック

- **Framework**: Next.js 14.2.5 (App Router, Static Export)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3 + Noto Sans JP
- **Testing**: Vitest (92 tests)
- **Deploy**: Vercel

---

## セットアップ

```bash
cd ~/Documents/GUILD_AI
npm install
npm run dev        # http://localhost:3000
```

| コマンド | 用途 |
|---------|------|
| `npm run build` | プロダクションビルド |
| `npm run typecheck` | 型チェック |
| `npm test` | Vitest 単体テスト（92件） |

---

## アーキテクチャ

```
src/
├── types/index.ts              # 共通型定義（CCAF, CheckoutSession, EscrowRecord...）
├── lib/
│   ├── ai-auditor/             # S/A/B ランク判定 + Floor Price 算出
│   ├── trust-score/            # Trust Score (0-1000) 計算
│   ├── checkout/               # チェックアウトセッション管理
│   ├── payments/               # fiat.ts / jpyc.ts / payouts.ts
│   ├── escrow/                 # エスクロー（hold → confirm → release）
│   ├── api-gateway/            # 決済確認 → API Key 発行
│   ├── passbook/               # 知能資産 通帳スナップショット（決定論的モック）
│   ├── ses-leverage/           # SES レバレッジ計算
│   ├── contribution-rank/      # 知能貢献ランク（5段階）
│   ├── marketplace/            # 自動出品・フィルタ・ソート
│   ├── royalty/                # ロイヤリティ分配
│   └── ownership/              # 資産所有権管理
├── components/
│   ├── CheckoutSection.tsx     # ハイブリッド支払い UI（4タイル）
│   ├── RankBadge.tsx           # S/A/B ランクバッジ
│   └── StepIndicator.tsx       # ① 登記 → ② 管理 → ③ 流通
└── app/
    ├── page.tsx                # トップページ
    ├── marketplace/            # Marketplace
    ├── sell/                   # 出品フロー
    ├── dashboard/              # 通帳 + 資産管理
    └── asset/[id]/             # 資産詳細 + 購入
```

---

## デザインシステム

- **アクセント**: JPYC ブルー `#1A6BB5`（安心・信頼）
- **サクセス**: グリーン `#0FA968`（完了・収益）
- **背景**: `#FAFAFA`（清潔感）
- **フォント**: Noto Sans JP（日本語ファースト）

詳細: [docs/design-guideline.md](docs/design-guideline.md) / [docs/Japanese-UX設計.md](docs/Japanese-UX設計.md)

---

## 設計の三大コンセプト

- **Proof of Make** — こだわり・思考プロセスを制作の証明として資産化
- **Ambassador Meritocracy** — Discord 拡散貢献の収益化
- **Trust-Based Pricing** — 信用スコアに基づく Floor Price 担保

---

> 詳細な設計: [docs/マスター設計図.md](docs/マスター設計図.md) | [docs/用語集.md](docs/用語集.md)
