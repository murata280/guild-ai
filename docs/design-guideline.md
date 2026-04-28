# GUILD AI デザインガイドライン

参考サイトのビジュアル言語を踏まえた UI 設計の共通ルール。

---

## カラーパレット

| トークン | Tailwind クラス | 値 | 用途 |
|---------|---------------|-----|------|
| kuroko | `text-kuroko` / `bg-kuroko` | `#1A1628` | メインテキスト、ダークUI要素 |
| kaki | `text-kaki` / `bg-kaki` | `#9B6BB5` | ブランドパープル。ランクS、CTA、アクティブ状態 |
| kami | `bg-kami` | `#F8F6F2` | ページ背景（温かみのあるオフホワイト） |
| surface-inset | `bg-surface-inset` | `#F2F0EB` | サイドバー背景 |
| text-secondary | inline `text-[#4A4464]` | `#4A4464` | 補助テキスト |
| text-muted | inline `text-[#9890A8]` | `#9890A8` | ラベル、説明テキスト |

---

## タイポグラフィ

- フォント: Noto Sans JP（日本語）＋ system-ui
- 見出し h1: `text-2xl font-bold tracking-tight text-kuroko`
- 見出し h2（カード内）: `text-sm font-semibold text-kuroko`
- ラベル: `text-[11px] uppercase tracking-widest text-[#9890A8]`
- 本文: `text-sm text-[#4A4464] leading-relaxed`
- 補助: `text-xs text-[#9890A8]`

---

## コンポーネント

### section-card（globals.css に定義）
```
bg-white rounded-2xl border border-kuroko/10
box-shadow: 0px 1px 2px rgba(0,0,0,0.04), 0px 2px 6px rgba(0,0,0,0.03)
```
- ホバー: `hover:shadow-card-hover`
- クリック: `active:scale-[0.97]`

### btn-primary（globals.css に定義）
```
bg-kaki text-white rounded-lg px-5 py-2.5 text-sm font-medium
transition-all active:scale-[0.98] hover:opacity-90
```

### btn-secondary（globals.css に定義）
```
border border-kuroko/20 text-[#4A4464] rounded-lg px-5 py-2.5 text-sm font-medium
hover:bg-kuroko/5 active:scale-[0.98]
```

---

## レイアウト

### Desktop（lg+）
- 左サイドバー: `w-52 bg-surface-inset border-r border-kuroko/10`
  - ロゴ高さ: `h-14`
  - ナビ項目: `px-3 py-2 rounded-lg text-[13px] font-medium`
  - Active: `bg-kaki/10 text-kaki`
  - Inactive: `text-[#4A4464] hover:bg-kuroko/[0.04]`
- メインコンテンツ: `flex-1 overflow-y-auto`
  - ページ内パディング: `px-4 sm:px-6 lg:px-8 py-8`
  - 最大幅: `max-w-3xl` または `max-w-4xl mx-auto`

### Mobile
- トップヘッダー: `h-14 glass-header border-b border-kuroko/10`
- ボトムナビ: `h-14 border-t border-kuroko/10 bg-kami`
  - アクティブ: `text-kaki` + 下線インジケーター
  - 非アクティブ: `text-[#9890A8]`

---

## ランクバッジ

| ランク | スタイル |
|-------|---------|
| S | `bg-kaki text-white` (ブランドパープル) |
| A | `bg-zinc-300 text-kuroko` (シルバー) |
| B | `bg-amber-700 text-white` (ブロンズ) |

---

## メッセージング原則

「**良質な出品が売れる**」を軸に：
- Trust Score が高いほど露出・価格が上がることを明示
- S ランクは最大 +50% プレミアムと伝える
- 二次収益（ロイヤリティ）もベネフィットとして訴求
- CTA は「出品する」「Marketplace を見る」の2本に集約
- 「創る」「Create」は使用しない

---

## 削除した概念
- **「創る」セクション / Create ナビ** → guild-ai のナビには存在しない
- トップナビバー → 左サイドバー（desktop）＋ボトムナビ（mobile）に変更
