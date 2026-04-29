# GUILD AI — Hybrid Visual Asset Hierarchy 設計図

## 概要

ユーザーが写真を提供した場合はそれを使い、そうでない場合は assetId から決定論的に生成された SVG 紋章（Asset Emblem）をサムネイルとして表示する「ハイブリッド視覚識別」システム。

---

## 視覚優先順位

```
写真（ユーザーアップロード） > 知能の紋章（Asset Emblem · SVG自動生成）
```

実装: `src/components/HumanThumbnail.tsx`

---

## Asset Emblem — 知能の紋章

`src/lib/asset-emblem/index.ts`

### 生成ルール

| パラメータ | 範囲 | 説明 |
|-----------|------|------|
| `axes` | 5 or 7 | 放射対称軸数（djb2 seed の偶奇） |
| `petalRadius` | 28–37 | 花びら楕円の長半径（100×100 viewBox 基準） |
| `centerRadius` | 10–17 | 中心円の半径 |
| `rotation` | 0–359° | 全体の回転角 |
| `hasOuterRing` | true/false | 外周装飾リングの有無 |
| `primaryColor` | PALETTE 10色 | 花びら主色（linearGradient 上端） |
| `secondaryColor` | PALETTE（primary と異なる） | 花びら副色（linearGradient 下端） + リング色 |
| `accentColor` | PALETTE（上2色と異なる） | 中心円の radialGradient 色 |

### 色パレット（10色）

| 色名 | カラーコード |
|------|------------|
| kaki blue | `#1A6BB5` |
| accent green | `#0FA968` |
| violet | `#9B6BB5` |
| orange | `#E8621C` |
| mid blue | `#2D7FBF` |
| rose | `#E84C88` |
| amber | `#F5A623` |
| teal | `#4ECDC4` |
| purple | `#6C5CE7` |
| red | `#E84C4C` |

3色は重複なしで保証（index 除外アルゴリズムで選定）。

### SVG 構造

```
<svg viewBox="0 0 100 100">
  <defs>
    <linearGradient> — 花びら塗り
    <radialGradient> — 中心円塗り
  </defs>
  <circle r="50"> — 背景ディスク（opacity 0.08）
  <g transform="rotate(i × 360/axes + rotation)">
    <ellipse> — 花びら (axes 個)
  </g>
  <circle> — 外周リング（オプション）
  <circle> — 中心ジュエル
  <circle r="cr×0.4"> — 中心ハイライト（白、opacity 0.5）
</svg>
```

---

## API エンドポイント

### GET /api/emblem/[assetId]

```
Content-Type: image/svg+xml
Cache-Control: public, max-age=86400
```

`generateEmblemSpec(assetId)` → `renderEmblemSvg(spec)` → SVG レスポンス

### GET /api/catalog（emblem フィールド追加）

```json
{
  "agents": [{
    "emblem": {
      "spec": { ...EmblemSpec },
      "svgUrl": "/api/emblem/{id}",
      "vectorEmbedding": [0.71, 0.82, ...]
    }
  }]
}
```

### POST /api/atoa/[id]（emblem フィールド追加）

```json
{
  "emblem": {
    "vectorEmbedding": [0.71, 0.82, ...],
    "svgUrl": "/api/emblem/{id}"
  }
}
```

---

## Vector Embedding（AtoA 類似度マッチング用）

`specToVectorEmbedding(spec)` → `number[]` (14次元)

| インデックス | 値 | 正規化 |
|------------|----|----|
| 0 | axes | ÷ 7 |
| 1 | petalRadius | ÷ 40 |
| 2 | centerRadius | ÷ 20 |
| 3 | rotation | ÷ 360 |
| 4 | hasOuterRing | 0 or 1 |
| 5–7 | primaryColor RGB | ÷ 255 |
| 8–10 | secondaryColor RGB | ÷ 255 |
| 11–13 | accentColor RGB | ÷ 255 |

---

## asset-photos — ユーザー写真ストレージ

`src/lib/asset-photos/index.ts`

| 関数 | 説明 |
|------|------|
| `getPhoto(assetId)` | localStorage から dataUrl 取得（SSR では null） |
| `setPhoto(assetId, dataUrl)` | localStorage に保存 |
| `removePhoto(assetId)` | localStorage から削除 |

キープレフィックス: `guild_photo_{assetId}`

SSR 安全: `typeof window === "undefined"` ガードで null 返却。

---

## コンポーネント構成

```
HumanThumbnail
  ├── (photoUrl && !imgErr) → <img src={photoUrl}>
  └── fallback → <AssetEmblem assetId={...} size={...} />

AssetEmblem
  └── JSX SVG（dangerouslySetInnerHTML 禁止）
      ├── <defs> linearGradient / radialGradient
      ├── background <circle>
      ├── <g transform="rotate(...)"> × axes 個
      │     <ellipse> — 花びら
      ├── (optional) 外周 <circle stroke>
      └── 中心 <circle> × 2（ジュエル + ハイライト）
```

---

## Shimmer アニメーション

`src/app/globals.css`

```css
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}
.shimmer {
  background: linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.45) 50%, transparent 75%);
  background-size: 200% 100%;
  animation: shimmer 0.6s ease-in-out infinite;
}
```

- `prefers-reduced-motion: reduce` 対応（animation: none に切り替え）

---

## /sell 完了画面 — 写真アップロードセクション

```
┌──────────────────────────────────────────────────────┐
│  [56px 紋章/写真] │ 写真でも見せる（任意）              │
│                  │ 顔写真や作品画像を追加できます         │
│                  │ [📷 画像を選ぶ]                      │
└──────────────────────────────────────────────────────┘
```

- ファイル選択 → FileReader で dataUrl 変換 → `setPhoto(listingId, dataUrl)` 保存
- 即座にプレビュー表示（useState(photoPreview)）

---

## 関連ファイル

| ファイル | 役割 |
|---------|------|
| `src/lib/asset-emblem/index.ts` | EmblemSpec 型 + generateEmblemSpec() + renderEmblemSvg() + specToVectorEmbedding() |
| `src/lib/asset-emblem/__tests__/asset-emblem.test.ts` | 14 テスト（決定論・範囲・SVG構造・ベクトル） |
| `src/lib/asset-photos/index.ts` | getPhoto / setPhoto / removePhoto（SSR安全） |
| `src/lib/asset-photos/__tests__/asset-photos.test.ts` | 12 テスト |
| `src/components/AssetEmblem.tsx` | JSX SVG レンダラー（use client） |
| `src/components/HumanThumbnail.tsx` | 写真 > 紋章出し分け（use client） |
| `src/app/api/emblem/[assetId]/route.ts` | GET → image/svg+xml |
| `src/app/api/catalog/route.ts` | emblem フィールド追加 |
| `src/app/api/atoa/[id]/route.ts` | emblem.vectorEmbedding 追加 |
| `src/app/globals.css` | shimmer keyframe + .shimmer クラス |
| `src/app/showcase/page.tsx` | HumanThumbnail サムネイル（旧グラデ置換） |
| `src/app/marketplace/page.tsx` | HumanThumbnail サムネイル |
| `src/app/asset/[id]/page.tsx` | AssetEmblem タイトル行 |
| `src/app/sell/page.tsx` | 写真アップロード完了画面セクション |
| `src/lib/__tests__/visual-hierarchy.test.ts` | 19 テスト（API・CSS・ページ統合） |
