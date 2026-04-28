# GUILD AI デザインガイドライン（v2 — Japanese-Centric）

参考: Mercari的な安心感・清潔感をベースに、JPYCブルーで信頼と革新を表現。

---

## カラーパレット（v2）

| トークン | Tailwind クラス | 値 | 用途 |
|---------|---------------|-----|------|
| kuroko | `text-kuroko` / `bg-kuroko` | `#1A1628` | メインテキスト、ダークUI要素 |
| kaki | `text-kaki` / `bg-kaki` | `#1A6BB5` | **JPYCブルー**（旧パープルから変更）。CTA、アクティブ状態、ランクS |
| accent-green | `text-accent-green` / `bg-accent-green` | `#0FA968` | 成功・完了・ロイヤリティ等のポジティブ状態 |
| kami | `bg-kami` | `#FAFAFA` | ページ背景（ニュートラルなオフホワイト） |
| surface-inset | `bg-surface-inset` | `#F4F4F5` | サイドバー背景・カード内の区画 |
| text-secondary | inline `text-[#3A3664]` | `#3A3664` | 補助テキスト（本文・ラベル） |
| text-muted | inline `text-[#9890A8]` | `#9890A8` | 説明・ヒント・ラベル |

### カラー変更の意図
- **パープル→ブルー**: JPYC（円ペッグ）= 安心・安定を想起させるブルー系。クリプト警戒心を解く。
- **グリーン追加**: 成功・収益・ポジティブな状態専用。赤との補色で視認性が高い。
- **背景はニュートラル**: `#FAFAFA`（ほぼ白）で清潔感。メルカリ的安心感。

---

## タイポグラフィ（v2）

- **フォント**: `Noto Sans JP`（Google Fonts、next/font経由）→ 日本語ファーストの読みやすさ
- **文字間・行間**: 見出し `leading-snug`、本文 `leading-relaxed`
- **最小フォントサイズ**: 本文は `text-base`（16px）。`text-sm` は補助情報のみ。

| 用途 | クラス |
|------|-------|
| ページ見出し h1 | `text-2xl font-bold tracking-tight text-kuroko leading-snug` |
| セクション見出し h2 | `text-base font-bold text-kuroko` |
| ラベル | `text-xs font-semibold uppercase tracking-widest text-[#9890A8]` |
| 本文 | `text-base text-[#3A3664] leading-relaxed` |
| 補助 | `text-sm text-[#9890A8]` |

---

## コンポーネント

### section-card（globals.css）
```
bg-white rounded-2xl border border-kuroko/10
box-shadow: 0px 1px 2px rgba(0,0,0,0.04), 0px 2px 6px rgba(0,0,0,0.03)
```

### btn-primary（globals.css）— JPYCブルー
```
bg-kaki text-white rounded-lg px-5 py-2.5 text-sm font-medium
transition-all active:scale-[0.98] hover:opacity-90
```

### btn-secondary（globals.css）— ゴーストスタイル
```
border border-kuroko/20 text-[#3A3664] rounded-lg px-5 py-2.5 text-sm font-medium
hover:bg-kuroko/5 active:scale-[0.98]
```

### input-base（globals.css）— 統一インプット
```
w-full rounded-lg border border-kuroko/20 bg-white px-3 py-2.5 text-base text-kuroko
placeholder-[#9890A8] focus:border-kaki focus:outline-none focus:ring-2 focus:ring-kaki/20
```

---

## ランクバッジ（RankBadge.tsx）

| ランク | スタイル |
|-------|---------|
| S | `bg-kaki text-white border border-amber-400/60`（ブルー + 金縁） |
| A | `bg-zinc-300 text-kuroko border border-zinc-400/40`（シルバー） |
| B | `bg-amber-700 text-white border border-amber-800/40`（ブロンズ） |

高さ24px（`large`プロップでh-6の大型バッジも可）

---

## ダークモード

- デフォルトは**ライトモードのみ**。`color-scheme: light` を明示。
- `prefers-color-scheme: dark` の自動切替は無効化。
- ダークモード対応は将来バージョンの検討事項。

---

## アクセシビリティ

- ボタンには `aria-label` 必須
- コントラスト比 4.5:1 以上を維持
- `aria-pressed` / `aria-checked` / `role="switch"` を適切に使用
- ローディング状態は `role="status"`、エラーは `role="alert"`

---

## レイアウト

### Desktop（lg+）
- 左サイドバー: `w-52 bg-surface-inset border-r border-kuroko/10`
- メインコンテンツ最大幅: `max-w-3xl` または `max-w-4xl mx-auto`

### Mobile（375px基準）
- トップヘッダー: `h-14 glass-header border-b border-kuroko/10`
- ボトムナビ: `h-14 border-t border-kuroko/10 bg-kami`
- カード等は `flex-col sm:flex-row` で縦積み対応

---

## 絶対NG語（UIテキスト禁止語）

> 以下の語はユーザー向けUIに絶対使用しない（内部コード変数名は除く）

| NG語 | 理由 | 代替表現 |
|------|------|---------|
| ガス | Web3用語、警戒感 | 手数料、取引コスト |
| ETH / ether | 暗号資産用語 | — |
| ウォレット単独使用 | 誤解を招く | JPYC残高、受け取りアドレス |
| Network（ネットワーク選択） | Web3用語 | — |
| Web3 | 用語として前面に出さない | — |
| CCAF（UI表記） | 内部用語 | 制作の証明、こだわり音声入力 |
| 創る | 禁止表現 | 出品する、登記する |
