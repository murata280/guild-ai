# GUILD AI — Singularity Standard UI 設計書

## 概要

Singularity Standard UI は、GUILD AI の第5世代ビジュアルシステム。
「表側の感情」と「裏側の技術」の二層UI、シマエナガマスコット、情緒タグ辞書、JSON-LD構造化データ、Flip-Motion カード、Activity Pulse、Two-Way Pricing を統合し、感情とデータの両面でスキル資産を表現する。

---

## 1. 表側/裏側の二層UI設計

### 概念

各カードは表側（感情面）と裏側（技術面）の2つのレイヤーを持つ。

| レイヤー | 内容 | 対象ユーザー |
|---------|------|------------|
| 表側 (Front) | 情緒タグ・ヒーロー画像・価格・StarRating | 一般ユーザー・購入者 |
| 裏側 (Back) | id/rank/trustScore の JSON・curl例・Activity Pulse | エンジニア・AIエージェント |

### 動作仕様

- **PC**: `onMouseEnter` でフリップ、`onMouseLeave` でアンフリップ
- **モバイル**: `onClick` でトグル
- **reduced-motion**: 3D フリップなし（フェードのみ）
- **キーボード**: `<button aria-pressed={flipped}>` でアクセシブル
- aria-live: "裏面表示中" をポライトに通知

### 実装コンポーネント

`src/components/FlipCard.tsx`

```
FlipCard
├── front: React.ReactNode  — 表面コンテンツ
├── back: React.ReactNode   — 裏面コンテンツ
└── className?: string
```

CSS 仕様:
- `transform-style: preserve-3d`
- `transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)`
- 表面: `backface-visibility: hidden`
- 裏面: `backface-visibility: hidden` + `rotateY(180deg)` で初期化

---

## 2. シマエナガ (Shimaenaga) バリアント表

`src/components/Shimaenaga.tsx`

純粋 JSX SVG で実装。白い丸い体・黒い目・小さなくちばし。アクセントカラー `#FFCC00`。

### バリアント

| バリアント | 持ち物 | 使用箇所 |
|-----------|-------|---------|
| `wave` | 片翼を上げてあいさつ | サイドバーロゴ横、404ページ |
| `trust` | 小さなメモ帳 | 信頼パネル全般 |
| `key` | 鍵の形 | Trust-Lock セクション |
| `coin` | 金色のコイン（¥マーク付き） | 出品完了画面 |

### サイズ

| Size | px |
|------|----|
| `xs` | 24px |
| `sm` | 40px |
| `md` | 64px |
| `lg` | 96px |

### 配置一覧

| 場所 | バリアント | サイズ |
|------|----------|-------|
| `src/app/layout.tsx` サイドバーロゴ横 | `wave` | `xs` |
| `src/app/sell/page.tsx` CompletionCard | `coin` | `sm` |
| `src/app/asset/[id]/page.tsx` Trust-Lock | `key` | `md` |
| `src/app/not-found.tsx` | `wave` | `lg` |

---

## 3. 情緒タグ辞書 (Emotional Tags)

`src/lib/emotional-tags/index.ts`

技術用語の代わりに、感情・利益を表す日本語タグでスキル資産を説明する。
djb2 ハッシュにより各資産に対して決定論的に3つのタグを選択。

### ランク別許可表

| ランク | 許可タグ |
|--------|---------|
| **S** | 神UI, 魔法レベル, 爆速化, 自動化のプロ, 面倒ゼロ, 気が利く, 縁の下, ぐっすり眠る |
| **A** | 爆速化, 自動化のプロ, 気が利く, 縁の下, 速攻仕事, 面倒ゼロ, ぐっすり眠る |
| **B** | 速攻仕事, 縁の下, ぐっすり眠る, 気が利く, 安心感 |

**ルール**: B ランクは「神UI」「魔法レベル」を含まない。S ランクのみ全タグを使用可。

---

## 4. JSON-LD / Schema.org フィールド定義

`src/lib/structured-data/index.ts`

各資産ページ (`/asset/[id]`) に `<script type="application/ld+json">` として注入。

### フィールド定義

| フィールド | 型 | 説明 |
|-----------|---|------|
| `@context` | string | `"https://schema.org"` |
| `@type` | string[] | `["Product", "SoftwareApplication"]` |
| `@id` | string | `https://guild-ai.vercel.app/asset/{id}` |
| `name` | string | 資産タイトル |
| `description` | string | 資産説明文 |
| `applicationCategory` | string | `"BusinessApplication"` |
| `operatingSystem` | string | `"API"` |
| `provider` | Object | `{ "@type": "Organization", "name": "GUILD AI" }` |
| `offers.price` | number | floorPrice (JPY) |
| `offers.priceCurrency` | string | `"JPY"` |
| `offers.availability` | string | `"https://schema.org/InStock"` |
| `additionalProperty[qualityScore]` | number | auditResult.score |
| `additionalProperty[rank]` | string | S/A/B |
| `additionalProperty[trustScore]` | number | 0–1000 |
| `additionalProperty[agentEndpoint]` | string | AtoA API URL |
| `additionalProperty[vectorEmbedding]` | string | emblemSpec の埋め込みベクトル（先頭5次元） |

### asset-001 のサンプル（主要フィールド）

```json
{
  "@context": "https://schema.org",
  "@type": ["Product", "SoftwareApplication"],
  "@id": "https://guild-ai.vercel.app/asset/asset-001",
  "name": "AI コード補完エンジン β",
  "offers": { "price": 69625, "priceCurrency": "JPY" },
  "additionalProperty": [
    { "name": "rank", "value": "S" },
    { "name": "trustScore", "value": 785 },
    { "name": "agentEndpoint", "value": "https://guild-ai.vercel.app/api/atoa/asset-001" }
  ]
}
```

---

## 5. Flip-Motion 動作仕様

### アニメーション

```
transform: rotateY(0deg)   → rotateY(180deg)
transition: 0.55s cubic-bezier(0.22, 1, 0.36, 1)
```

### インタラクション

| デバイス | トリガー | アンフリップ |
|---------|---------|------------|
| PC (hover対応) | mouseenter | mouseleave |
| モバイル (touch) | click/tap | 2回目のtap |
| キーボード | click (button要素) | 2回目クリック |

### アクセシビリティ

- `<button aria-pressed={flipped}>` でフリップ状態を宣言
- `aria-live="polite"` で "裏面表示中" を通知
- `backface-visibility: hidden` で表裏の同時表示を防止
- `prefers-reduced-motion`: 3D フリップを無効化、フェードのみ

---

## 6. Activity Pulse 仕様

`src/components/ActivityPulse.tsx`

### アルゴリズム

1. `djb2(assetId)` でベース rps を 1–30 の範囲で生成（決定論的）
2. 3秒ごとに ±10% 揺らぎを加算して更新
3. 表示: 「今この瞬間 {rps} 回 / 分」

### SVG ハートビートライン

```
M 0 10 L 10 10 L 15 2 L 20 18 L 25 10 L 60 10
```

CSS アニメーション: `pulse-line 1.2s ease-in-out infinite` (opacity 1→0.4→1)

### アクセシビリティ

- `aria-live="polite"` — 30秒ごと（10ティックごと）のみ更新
- 視覚的な数値は `aria-hidden` で頻繁に更新しても読み上げ過多にならない
- `prefers-reduced-motion`: アニメーション停止、静的ラインのみ表示

### 配置一覧

| 場所 | 用途 |
|------|------|
| `/marketplace` カード裏面 | 技術仕様の一部として表示 |
| `/asset/[id]` ヒーロー下 | リアルタイム利用状況を表示 |
| `/wallet` PassbookCard | 「保有資産の鼓動」として表示 |

### rps 範囲

- 最小: 1 rps（djb2 % 30 + 1 の下限）
- 最大: 30 rps（djb2 % 30 + 1 の上限）
- 揺らぎ: ±10%（各3秒ごと）
- 実効範囲: 1–33 rps

---

## 7. Two-Way Pricing 計算式と例

`src/lib/checkout/index.ts`

### 計算式

```typescript
// Floor Price から月額を導出
monthlyJpy = Math.round(floorPrice / 12)

// 月額から3プランを導出
oneoffJpy = monthlyJpy * 12
perCallJpyc = Math.max(0.1, Math.round((monthlyJpy / 2000) * 10) / 10)
```

### 例

#### asset-001 (AI コード補完エンジン β)

| 項目 | 値 |
|------|---|
| Floor Price | ¥69,625 |
| 月額 | ¥5,802 / 月 |
| 買い切り | ¥69,624 |
| リクエスト単価 | 2.9 デジタル円 |

#### asset-005 (データクリーニング スクリプト集)

| 項目 | 値 |
|------|---|
| Floor Price | ¥9,820 |
| 月額 | ¥818 / 月 |
| 買い切り | ¥9,816 |
| リクエスト単価 | 0.4 デジタル円 |

### 特記事項

- `perCallJpyc` の最低値は 0.1（ゼロ除算・マイクロペイメント下限）
- 月額は Floor Price ÷ 12 の四捨五入
- 全プランは同一 `computeBundlePricing()` から派生し一貫性を保証

---

*設計バージョン: Refinement v5 (Singularity Standard UI)*
*最終更新: 2026-04-29*
