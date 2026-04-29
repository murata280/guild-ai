# Double-Layer UI 設計 (#49)

## 概要

双層 UI アーキテクチャ。一般ユーザー向けの「やさしい説明」と技術者向けの「くわしい仕様」を同一ページに共存させる。モバイルではタブ切り替え、デスクトップでは2カラムレイアウトを提供する。

---

## コンポーネント一覧

| コンポーネント | ファイル | 役割 |
|---|---|---|
| BilingualLayout | `src/components/BilingualLayout.tsx` | タブ/2カラムの切り替えコンテナ |
| Shimaenaga (mode付き) | `src/components/Shimaenaga.tsx` | 文脈に応じたマスコット表示 |
| IntelligenceCore | `src/components/IntelligenceCore.tsx` | ガラス玉型の知能コアウィジェット |
| morph lib | `src/lib/morph/index.ts` | View Transitions API + MorphTag |

---

## モバイル / デスクトップ レイアウト図

### モバイル (< 768px)

```
+----------------------------------+
|  [やさしい説明] [くわしい仕様]    | <- tablist
+----------------------------------+
|                                  |
|  アクティブタブのコンテンツ       | <- tabpanel
|                                  |
+----------------------------------+
```

### デスクトップ (>= 768px)

```
+-------------------+------------+
|                   |            |
|  やさしい説明     | くわしい   |
|  (3fr = 60%)      | 仕様       |
|                   | (2fr = 40%)|
|  - 説明文         | - CCAF詳細 |
|  - こだわりメモ   | - AI評価   |
|  - ActivityPulse  | - GUILD-ID |
|                   | - 指標3つ  |
+-------------------+------------+
```

---

## Shimaenaga モード対応表

| mode | variant 組み合わせ例 | 外観 | 主な用途 |
|------|---|---|---|
| (なし) | wave / trust / key / coin | 既存の鳥 | 汎用 |
| avatar | wave | 瞬き アニメーション付き | ユーザーアバター |
| seal | trust | 丸いスタンプ + GUILD CERTIFIED | 認証済みバッジ |
| guardian | key | 盾 + 翼を大きく広げた姿 | 権利主張フローのガイド |

---

## アクセシビリティチェックリスト

- [x] BilingualLayout: `role="tablist"` / `role="tab"` / `role="tabpanel"`
- [x] BilingualLayout: `aria-selected` / `aria-controls` / `aria-labelledby`
- [x] Shimaenaga avatar: `@media (prefers-reduced-motion: no-preference)` でのみアニメーション
- [x] Shimaenaga seal: `role="img"` + `aria-label` に「認証スタンプ」を含む
- [x] Shimaenaga guardian: `role="img"` + `aria-label` に「ガーディアン守り神」を含む
- [x] IntelligenceCore: `role="img"` + `aria-label="知能コア"` + pulse は `prefers-reduced-motion` ガード済み

---

## View Transitions

`startViewTransition(callback)` は `document.startViewTransition` が利用可能な環境でのみ View Transitions API を呼び出し、未対応環境では同期的に `callback()` を実行する。`assignMorphTag` はアセット ID + ランクから決定論的な `view-transition-name` 用タグを生成する。
