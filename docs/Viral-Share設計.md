# Viral Social Provocation 設計書（#30）

## 概要

GUILD AI の核心体験（登録・購入・Sランク昇格・AI採用・収益マイルストーン）を
SNS で爆発的に拡散させるためのシェアエンジン。
挑発的・実体験ベースの「刺さるコピー」でインプレッションを最大化する。

---

## 1. Social Copywriting Engine

`src/lib/social-share/index.ts`

### ShareContext（5種）

| type | 発火タイミング |
|---|---|
| `listing_published` | スキル資産の登録完了（`/sell` CompletionCard） |
| `purchase_done` | 資産購入完了（`CheckoutSection` success state） |
| `rank_up_s` | AランクからSランク昇格（`WillSignalTrigger` done state） |
| `atoa_job` | AIジョブ完了通知（`NotificationBell` ドロップダウン） |
| `passbook_milestone` | 月次収益マイルストーン（Dashboard `PassbookCard`） |

### テンプレート設計原則（3本/context = 計15本）

1. **フック1行目** — 読者が続きを読みたくなる事実/告白
2. **実体験** — 「自分がやってみたらこうだった」形式。正論禁止
3. **問いかけ/余韻** — 読者に行動を促す問い or 余韻のある一文
4. **ハッシュタグ** — `#GUILDAI` + コンテキスト別（`#スキルエコノミー` / `#お墨付き`）
5. **文字数** — 200文字以内（X URLヘッドルームを確保）

### API

```typescript
generateShareText(context: ShareContext, seed?: number): string
// seed指定で決定論的（テスト可能）、未指定でランダム

buildXShareUrl(text: string, url?: string): string
// → https://x.com/intent/tweet?text=...

buildLineShareUrl(text: string, url: string): string
// → https://social-plugins.line.me/lineit/share?url=...&text=...

nativeShare(text: string, url: string, title?: string): Promise<boolean>
// Web Share API ラッパー（モバイル優先）
```

---

## 2. ShareButton コンポーネント

`src/components/ShareButton.tsx` — `"use client"`

### Props

| prop | 型 | 説明 |
|---|---|---|
| `context` | `ShareContext` | シェアコンテキスト（テンプレート選択に使用） |
| `url` | `string?` | シェアに含めるページURL（省略時は `window.location.href`） |
| `seed` | `number?` | テンプレート選択の固定シード |
| `compact` | `boolean` | `true` = ボタン行のみ（プレビューなし） |
| `className` | `string` | 追加CSSクラス |

### 4つのシェアルート

| ボタン | 実装 |
|---|---|
| X | `<a href={buildXShareUrl(...)} target="_blank">` |
| LINE | `<a href={buildLineShareUrl(...)} target="_blank">` |
| コピー | `navigator.clipboard.writeText(text + '\n' + url)` |
| Native | `navigator.share(...)` — 対応ブラウザ（モバイル）のみ表示 |

### 配置箇所

| ページ/コンポーネント | コンテキスト | モード |
|---|---|---|
| `/sell` CompletionCard | `listing_published` | full（プレビュー付き） |
| `CheckoutSection` success | `purchase_done` | compact |
| `WillSignalTrigger` done | `rank_up_s` | compact |
| Dashboard `PassbookCard` | `passbook_milestone` | compact |

---

## 3. OGP メタデータ

### ルート（`src/app/layout.tsx`）

```typescript
openGraph: {
  title: "GUILD AI — スキルを資産に。AIが買いに来る。",
  description: "スキルを登録したら、AIが勝手に値段をつけた...",
  images: [{ url: "/og.png", width: 1200, height: 630 }],
}
twitter: { card: "summary_large_image", ... }
```

### 資産詳細ページ（`src/app/asset/[id]/page.tsx`）

`generateMetadata()` で資産名・説明・信用スコア・価格を動的注入。
共通OGP画像は `/og.png` を使用（将来: `next/og` で動的生成）。

### public/og.png

1200×630px の kuroko（ダークパープル）背景プレースホルダー。

---

## 4. テスト（10件）

`src/lib/social-share/__tests__/social-share.test.ts`

| # | テスト内容 |
|---|---|
| 1 | 5コンテキスト全てで非空文字列を返す |
| 2 | seed指定時に決定論的 |
| 3 | seed 0,1,2 で異なるテンプレートが選ばれる |
| 4 | 全テンプレートに #GUILDAI が含まれる |
| 5 | listing_published にフック要素（？/ですか/できる）がある |
| 6 | rank_up_s テンプレートに #お墨付き が含まれる |
| 7 | 全テンプレートが200文字以内 |
| 8 | buildXShareUrl が x.com/intent/tweet URL を返す |
| 9 | buildXShareUrl が url を tweet text に含める |
| 10 | buildLineShareUrl が LINE share URL を返す |

---

## 5. 二層トーン運用

| レイヤー | トーン | 担当ファイル |
|---|---|---|
| SNSシェア文 | 挑発的・実体験ベース（刺さるコピー） | `src/lib/social-share/index.ts` |
| UI/通知 | 執事トーン（です・ます・いたします） | `src/lib/microcopy/index.ts` |

SNS文は jargon-lint の対象外（ユーザーが外部に投稿するため）。

---

## 6. 関連ファイル

| ファイル | 役割 |
|---|---|
| `src/lib/social-share/index.ts` | 5コンテキスト×3テンプレート、URL生成 |
| `src/components/ShareButton.tsx` | X/LINE/Copy/Native 4ルートUI |
| `src/app/layout.tsx` | ルートOGP + Twitterカード |
| `src/app/asset/[id]/page.tsx` | 資産別動的OGP |
| `public/og.png` | OGP画像プレースホルダー |
